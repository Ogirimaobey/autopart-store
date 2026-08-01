import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import adminService from '../services/admin.service';
import { sendSuccess } from '../utils/response.util';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();
  sendSuccess(res, 200, 'Users retrieved successfully', users);
});

export const toggleUserBan = asyncHandler(async (req: Request, res: Response) => {
  const message = await adminService.toggleUserBan(req.params.id as string);
  sendSuccess(res, 200, message);
});

export const approveVendor = asyncHandler(async (req: Request, res: Response) => {
  const message = await adminService.approveVendor(req.params.id as string);
  sendSuccess(res, 200, message);
});

export const getPlatformStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getPlatformStats();
  sendSuccess(res, 200, 'Platform stats retrieved', stats);
});
