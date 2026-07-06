import type { Response } from "express";

export function sendSuccess<T>(res: Response, statusCode: number, message: string, data?: T): void {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
}

export function sendError(res: Response, statusCode: number, message: string, errors?: unknown): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  });
}
