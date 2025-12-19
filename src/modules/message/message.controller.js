import MessageService from './message.service.js';
import successResponse from '../../utils/successResponse.js';
import asyncHandler from '../../middleware/asyncHandler.js';

class MessageController {
 
  static sendMessage = asyncHandler(async (req, res) => {
    const result = await MessageService.sendMessage(req.user._id, req.body);
    
    res.status(201).json(
      successResponse(result, 'Message sent successfully', 201)
    );
  });

  static getMessages = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await MessageService.getMessages(req.user._id, page, limit);
    
    res.status(200).json(
      successResponse(result, 'Messages retrieved successfully')
    );
  });

 
  static getMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const message = await MessageService.getMessage(req.user._id, messageId);
    
    res.status(200).json(
      successResponse({ message }, 'Message retrieved successfully')
    );
  });

  
  static markAsRead = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const result = await MessageService.markAsRead(req.user._id, messageId);
    
    res.status(200).json(
      successResponse(result, 'Message marked as read')
    );
  });
}

export default MessageController;
