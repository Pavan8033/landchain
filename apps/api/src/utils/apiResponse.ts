import { Response } from "express";

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

export function sendApiError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(details !== undefined ? { details } : {}),
  });
}
