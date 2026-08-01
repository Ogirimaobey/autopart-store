import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import orderService from '../services/order.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const checkout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await orderService.createOrder(req.user!._id.toString(), req.body);
  sendSuccess(res, 201, 'Order placed successfully', order);
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getBuyerOrders(req.user!._id.toString());
  sendSuccess(res, 200, 'Orders retrieved successfully', orders);
});

export const getOrderDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await orderService.getOrderById(req.params.id as string, req.user!._id.toString());
  sendSuccess(res, 200, 'Order details retrieved successfully', data);
});
