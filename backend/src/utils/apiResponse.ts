import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponseData['meta']
): Response {
  const responsePayload: ApiResponseData<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta })
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendError(
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error !== undefined && { error })
  });
}
