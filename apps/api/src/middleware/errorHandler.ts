import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation error on request parameters or body.",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const message = err.message || "An unexpected internal server error occurred.";

  return res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || "INTERNAL_SERVER_ERROR",
  });
}
