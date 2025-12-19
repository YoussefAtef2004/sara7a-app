import nodemailer from 'nodemailer';
import { EventEmitter } from 'events';

class EmailService extends EventEmitter {
  static transporter = null;

  
  static initializeTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    return this.transporter;
  }

  
  static async sendEmail(to, subject, html) {
    try {
      const transporter = this.initializeTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Sara7a App <noreply@sara7a.com>',
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      return info;
    } catch (error) {
      console.error('Email sending failed:', error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  
  static async sendConfirmationEmail(user, otp) {
    const subject = 'Confirm Your Email - Sara7a';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: #fff; border: 2px dashed #4CAF50; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Sara7a!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.username},</p>
            <p>Thank you for registering with Sara7a. Please use the following OTP to confirm your email address:</p>
            <div class="otp">${otp}</div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't create an account with Sara7a, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sara7a. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  
  static async sendPasswordResetEmail(user, otp) {
    const subject = 'Reset Your Password - Sara7a';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp { font-size: 32px; font-weight: bold; color: #FF5722; text-align: center; padding: 20px; background-color: #fff; border: 2px dashed #FF5722; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${user.username},</p>
            <p>We received a request to reset your password. Use the following OTP to reset your password:</p>
            <div class="otp">${otp}</div>
            <p>This OTP will expire in 15 minutes.</p>
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Saraha. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  
  static async sendAccountStatusEmail(user, status) {
    const isFrozen = status === 'frozen';
    const subject = isFrozen ? 'Account Frozen - Sara7a' : 'Account Restored - Sara7a';
    const color = isFrozen ? '#FF5722' : '#4CAF50';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .status-box { padding: 15px; background-color: #fff; border-left: 4px solid ${color}; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Status Update</h1>
          </div>
          <div class="content">
            <p>Hi ${user.username},</p>
            <div class="status-box">
              <p><strong>Your account has been ${isFrozen ? 'frozen' : 'restored'}.</strong></p>
              ${isFrozen 
                ? '<p>You will not be able to log in until you restore your account.</p>' 
                : '<p>You can now log in and use all features of Sara7a.</p>'
              }
            </div>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Saraha. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}

const emailEmitter = new EventEmitter();

emailEmitter.on('user:registered', async (user, otp) => {
  try {
    await EmailService.sendConfirmationEmail(user, otp);
  } catch (error) {
    console.error('Failed to send confirmation email:', error.message);
  }
});

emailEmitter.on('password:reset-requested', async (user, otp) => {
  try {
    await EmailService.sendPasswordResetEmail(user, otp);
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
  }
});

emailEmitter.on('account:status-changed', async (user, status) => {
  try {
    await EmailService.sendAccountStatusEmail(user, status);
  } catch (error) {
    console.error('Failed to send account status email:', error.message);
  }
});

export { EmailService, emailEmitter };
