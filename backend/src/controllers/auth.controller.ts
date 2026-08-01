import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import authService from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, role } = req.body;

  const authData = await authService.register({
    fullName,
    email,
    passwordHash: password,
    role: role || 'BUYER',
  });

  sendSuccess(res, 201, 'User registered successfully', authData);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const authData = await authService.verifyEmail({ email, otp });
  sendSuccess(res, 200, 'Email verified successfully', authData);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const authData = await authService.login(email, password);
  sendSuccess(res, 200, 'Login successful', authData);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const message = await authService.forgotPassword(email);
  sendSuccess(res, 200, message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const message = await authService.resetPassword({ email, otp, newPassword });
  sendSuccess(res, 200, message);
});
