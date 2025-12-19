import Message from './message.model.js';
import User from '../user/user.model.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../../utils/errorClasses.js';

class MessageService {
  
  static async sendMessage(senderId, messageData) {
    const { recipientId, content, parentMessageId, isAnonymous } = messageData;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new NotFoundError('Recipient not found');
    }

    if (parentMessageId) {
      const parentMessage = await Message.findById(parentMessageId);
      if (!parentMessage) {
        throw new NotFoundError('Parent message not found');
      }

      if (parentMessage.recipient.toString() !== senderId.toString()) {
        throw new AuthorizationError('You can only reply to messages you received');
      }
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content, 
      parentMessage: parentMessageId || null,
      isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
    });

    await message.save();

    return {
      messageId: message._id,
      message: 'Message sent successfully',
    };
  }

 
  static async getMessages(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username profileImage')
      .lean();

    const decryptedMessages = Message.decryptMessages(messages);

    const processedMessages = decryptedMessages.map(msg => {
      if (msg.isAnonymous) {
        msg.sender = null;
      }
      return msg;
    });

    const total = await Message.countDocuments({ recipient: userId });

    return {
      messages: processedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

 
  static async getMessage(userId, messageId) {
    const message = await Message.findById(messageId)
      .populate('sender', 'username profileImage')
      .populate({
        path: 'replies',
        populate: {
          path: 'sender',
          select: 'username profileImage',
        },
      })
      .lean();

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.recipient.toString() !== userId.toString()) {
      throw new AuthorizationError('You can only view messages sent to you');
    }

    message.content = await Message.findById(messageId).then(m => m.decryptContent());

    if (message.replies && message.replies.length > 0) {
      message.replies = Message.decryptMessages(message.replies);
      
      message.replies = message.replies.map(reply => {
        if (reply.isAnonymous) {
          reply.sender = null;
        }
        return reply;
      });
    }

    if (message.isAnonymous) {
      message.sender = null;
    }

    return message;
  }


  static async markAsRead(userId, messageId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.recipient.toString() !== userId.toString()) {
      throw new AuthorizationError('You can only mark your own messages as read');
    }

    if (message.isRead) {
      return { message: 'Message already marked as read' };
    }

    message.isRead = true;
    await message.save();

    return { message: 'Message marked as read' };
  }
}

export default MessageService;
