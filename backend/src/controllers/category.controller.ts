import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import categoryService from '../services/category.service';
import { sendSuccess } from '../utils/response.util';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, 201, 'Category created successfully', category);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getCategories();
  sendSuccess(res, 200, 'Categories retrieved successfully', categories);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id as string);
  sendSuccess(res, 200, 'Category retrieved successfully', category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id as string, req.body);
  sendSuccess(res, 200, 'Category updated successfully', category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string);
  sendSuccess(res, 200, 'Category deleted successfully');
});
