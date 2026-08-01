import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import vendorService from '../services/vendor.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMyProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await vendorService.getMyProducts(req.user!._id.toString());
  sendSuccess(res, 200, 'My products retrieved', products);
});

export const getMySubOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subOrders = await vendorService.getMySubOrders(req.user!._id.toString());
  sendSuccess(res, 200, 'My orders retrieved', subOrders);
});

export const updateSubOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const message = await vendorService.updateSubOrderStatus(req.user!._id.toString(), req.params.id as string, status);
  sendSuccess(res, 200, message);
});

export const getMyWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wallet = await vendorService.getMyWallet(req.user!._id.toString());
  sendSuccess(res, 200, 'Wallet retrieved', wallet);
});
