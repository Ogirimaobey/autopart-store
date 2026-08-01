import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import productService from '../services/product.service';
import { sendSuccess } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = {
    ...req.body,
    vendorId: req.user!._id.toString(), // Inject the authenticated vendor's ID
  };
  const product = await productService.createProduct(data);
  sendSuccess(res, 201, 'Product created successfully', product);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await productService.getProducts(req.query);
  sendSuccess(res, 200, 'Products retrieved successfully', products);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id as string);
  sendSuccess(res, 200, 'Product retrieved successfully', product);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.updateProduct(req.params.id as string, req.user!._id.toString(), req.body);
  sendSuccess(res, 200, 'Product updated successfully', product);
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await productService.deleteProduct(req.params.id as string, req.user!._id.toString(), req.user!.role);
  sendSuccess(res, 200, 'Product deleted successfully');
});
