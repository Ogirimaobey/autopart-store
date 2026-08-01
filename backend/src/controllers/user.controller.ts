import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import userService from '../services/user.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new Error('Not authenticated');
  const user = await userService.getProfile(req.user._id.toString());
  sendSuccess(res, 200, 'User profile retrieved successfully', user);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new Error('Not authenticated');
  const user = await userService.updateProfile(req.user._id.toString(), req.body);
  sendSuccess(res, 200, 'User profile updated successfully', user);
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new Error('Not authenticated');
  const message = await userService.changePassword(req.user._id.toString(), req.body);
  sendSuccess(res, 200, message);
});
