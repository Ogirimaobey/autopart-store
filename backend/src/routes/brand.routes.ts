import express from 'express';
import { createBrand, getBrands, getBrandById, updateBrand, deleteBrand } from '../controllers/brand.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .get(getBrands)
  .post(protect, adminOnly, createBrand);

router.route('/:id')
  .get(getBrandById)
  .put(protect, adminOnly, updateBrand)
  .delete(protect, adminOnly, deleteBrand);

export default router;
