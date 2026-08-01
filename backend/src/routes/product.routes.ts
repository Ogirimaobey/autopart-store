import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller';
import { protect, vendorOnly } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, vendorOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, vendorOnly, updateProduct)
  .delete(protect, vendorOnly, deleteProduct); // Vendor or Admin (handled in service logic)

export default router;
