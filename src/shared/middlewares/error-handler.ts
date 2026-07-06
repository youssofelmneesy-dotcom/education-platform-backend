import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/index.js";
import { sendError } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";

function getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): { statusCode: number; message: string; errorCode: string } {
  switch (error.code) {
    case "P2002":
      return { statusCode: 409, message: "Resource already exists", errorCode: "RESOURCE_CONFLICT" };
    case "P2025":
      return { statusCode: 404, message: "Resource not found", errorCode: "RESOURCE_NOT_FOUND" };
    default:
      return { statusCode: 500, message: "Database error", errorCode: "DATABASE_ERROR" };
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    sendError(res, 400, "Validation failed", error.flatten().fieldErrors);
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = getPrismaErrorMessage(error);
    logger.warn(prismaError.message, { code: error.code, meta: error.meta });
    sendError(res, prismaError.statusCode, prismaError.message);
    return;
  }

  logger.error("Unhandled error", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.stack : undefined,
  });

  sendError(res, 500, "Internal server error");
};
