import express from 'express';
import { checkout, getMyOrders, getOrderDetails } from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .post(protect, checkout)
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderDetails);

export default router;
