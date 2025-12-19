import UserService from './user.service.js';
import successResponse from '../../utils/successResponse.js';
import asyncHandler from '../../middleware/asyncHandler.js';

class UserController {

    static getProfile = asyncHandler(async (req, res) => {
        const user = await UserService.getProfile(req.user._id);

        res.status(200).json(
            successResponse({ user }, 'Profile retrieved successfully')
        );
    });


    static updateProfile = asyncHandler(async (req, res) => {
        const user = await UserService.updateProfile(req.user._id, req.body);

        res.status(200).json(
            successResponse({ user }, 'Profile updated successfully')
        );
    });


    static uploadProfileImage = asyncHandler(async (req, res) => {
        const user = await UserService.uploadProfileImage(req.user._id, req.file);

        res.status(200).json(
            successResponse({ user }, 'Profile image uploaded successfully')
        );
    });


    static uploadCoverImage = asyncHandler(async (req, res) => {
        const user = await UserService.uploadCoverImage(req.user._id, req.file);

        res.status(200).json(
            successResponse({ user }, 'Cover image uploaded successfully')
        );
    });

 
    static freezeAccount = asyncHandler(async (req, res) => {
        const result = await UserService.freezeAccount(req.user._id);

        res.status(200).json(
            successResponse(result, 'Account frozen successfully')
        );
    });

    
    static restoreAccount = asyncHandler(async (req, res) => {
        const result = await UserService.restoreAccount(req.user._id);

        res.status(200).json(
            successResponse(result, 'Account restored successfully')
        );
    });
}

export default UserController;
