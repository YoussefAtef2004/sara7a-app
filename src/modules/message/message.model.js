import mongoose from 'mongoose';
import CryptoService from '../../services/crypto.service.js';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ recipient: 1, createdAt: -1 });

messageSchema.index({ parentMessage: 1 });

messageSchema.index({ sender: 1 });

messageSchema.virtual('replies', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'parentMessage',
});

messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

messageSchema.methods.encryptContent = function() {
  try {
    if (this.content && !this.content.includes(':')) {
      this.content = CryptoService.encryptSymmetric(this.content);
    }
  } catch (error) {
    throw new Error(`Content encryption failed: ${error.message}`);
  }
};

messageSchema.methods.decryptContent = function() {
  try {
    if (this.content && this.content.includes(':')) {
      return CryptoService.decryptSymmetric(this.content);
    }
    return this.content;
  } catch (error) {
    throw new Error(`Content decryption failed: ${error.message}`);
  }
};

messageSchema.statics.decryptMessages = function(messages) {
  return messages.map(message => {
    const messageObj = message.toObject ? message.toObject() : message;
    try {
      if (messageObj.content && messageObj.content.includes(':')) {
        messageObj.content = CryptoService.decryptSymmetric(messageObj.content);
      }
    } catch (error) {
      console.error('Failed to decrypt message:', error.message);
      messageObj.content = '[Decryption failed]';
    }
    return messageObj;
  });
};

messageSchema.pre('save', function(next) {
  try {
    if (this.isModified('content')) {
      this.encryptContent();
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
