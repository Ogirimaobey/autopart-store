import express from 'express';
import { getMyProducts, getMySubOrders, updateSubOrderStatus, getMyWallet } from '../controllers/vendor.controller';
import { protect, vendorOnly } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, vendorOnly);

router.get('/products', getMyProducts);
router.get('/orders', getMySubOrders);
router.put('/orders/:id/status', updateSubOrderStatus);
router.get('/wallet', getMyWallet);

export default router;
