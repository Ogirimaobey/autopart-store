import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'object' && (res as any).message
          ? (res as any).message
          : res;
    } else if ((exception as any)?.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ID format: ${(exception as any)?.value}`;
    } else if ((exception as any)?.code === 11000) {
      status = HttpStatus.CONFLICT;
      const keys = Object.keys((exception as any).keyValue || {});
      message = `Duplicate key error: value for field(s) '${keys.join(', ')}' already exists`;
    } else if ((exception as any)?.message) {
      message = (exception as any).message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
