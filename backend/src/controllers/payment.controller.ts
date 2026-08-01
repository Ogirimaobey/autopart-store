import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import paymentService from '../services/payment.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const initPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId } = req.body;
  const paymentData = await paymentService.initializePayment(orderId, req.user!._id.toString());
  sendSuccess(res, 200, 'Payment initialized', paymentData);
});

// In production, this would be a public POST without auth hit by Paystack
export const mockWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] as string;
  if (!signature) {
    res.status(400).send('Signature missing');
    return;
  }
  
  await paymentService.handleWebhook(req.body, signature);
  res.status(200).send('Webhook processed successfully');
});

export const confirmDelivery = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subOrderId } = req.body;
  await paymentService.confirmDelivery(subOrderId, req.user!._id.toString());
  sendSuccess(res, 200, 'Delivery confirmed, funds released to vendor');
});
