import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_HEADER = "x-request-id";

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incomingRequestId = req.header(REQUEST_ID_HEADER);
  const requestIdValue = incomingRequestId && incomingRequestId.trim() ? incomingRequestId : crypto.randomUUID();

  req.id = requestIdValue;
  res.setHeader(REQUEST_ID_HEADER, requestIdValue);

  next();
}

declare module "express-serve-static-core" {
  interface Request {
    id: string;
  }
}
