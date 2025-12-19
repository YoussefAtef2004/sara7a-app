import AuthService from './auth.service.js';
import successResponse from '../../utils/successResponse.js';
import asyncHandler from '../../middleware/asyncHandler.js';

class AuthController {
 
  static signup = asyncHandler(async (req, res) => {
    const user = await AuthService.createUser(req.body);
    
    res.status(201).json(
      successResponse(
        { user },
        'User registered successfully. Please check your email for OTP verification',
        201
      )
    );
  });


  static confirmEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await AuthService.confirmEmail(email, otp);
    
    res.status(200).json(
      successResponse(result, 'Email confirmed successfully')
    );
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    
    res.status(200).json(
      successResponse(result, 'Login successful')
    );
  });

  
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    
    res.status(200).json(
      successResponse(result, 'Token refreshed successfully')
    );
  });

  static logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const accessToken = req.token;
    const { refreshToken } = req.body;
    
    const result = await AuthService.logout(userId, accessToken, refreshToken);
    
    res.status(200).json(
      successResponse(result, 'Logged out successfully')
    );
  });

 
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    
    res.status(200).json(
      successResponse(result, result.message)
    );
  });

  
  static resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, otp, newPassword);
    
    res.status(200).json(
      successResponse(result, 'Password reset successfully')
    );
  });

  
  static googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    const result = await AuthService.googleLogin(idToken);
    
    res.status(200).json(
      successResponse(result, 'Google login successful')
    );
  });
}

export default AuthController;
