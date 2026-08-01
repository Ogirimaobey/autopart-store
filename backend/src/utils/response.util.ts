import { Response } from 'express';

export const sendSuccess = (res: Response, statusCode: number, message: string, data: any = null) => {
  res.status(statusCode).json({
    status: 'success',
    statusCode,
    message,
    data,
  });
};

export const sendError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    data: null,
  });
};
