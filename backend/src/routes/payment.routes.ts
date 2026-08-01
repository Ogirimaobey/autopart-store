import express from 'express';
import { initPayment, mockWebhook, confirmDelivery } from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/init', protect, initPayment);
router.post('/webhook', mockWebhook); // Public for Paystack
router.post('/confirm-delivery', protect, confirmDelivery);

export default router;
