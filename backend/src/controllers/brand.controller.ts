import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import brandService from '../services/brand.service';
import { sendSuccess } from '../utils/response.util';

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await brandService.createBrand(req.body);
  sendSuccess(res, 201, 'Brand created successfully', brand);
});

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await brandService.getBrands();
  sendSuccess(res, 200, 'Brands retrieved successfully', brands);
});

export const getBrandById = asyncHandler(async (req: Request, res: Response) => {
  const brand = await brandService.getBrandById(req.params.id as string);
  sendSuccess(res, 200, 'Brand retrieved successfully', brand);
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await brandService.updateBrand(req.params.id as string, req.body);
  sendSuccess(res, 200, 'Brand updated successfully', brand);
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  await brandService.deleteBrand(req.params.id as string);
  sendSuccess(res, 200, 'Brand deleted successfully');
});
