import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../services/auth.service.js";

export interface AuthenticatedUserPayload {
  sub: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authorizationHeader = req.header("Authorization") ?? req.header("authorization");

  if (!authorizationHeader) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  let payload: Record<string, unknown>;

  try {
    payload = verifyJwt(token, secret);
  } catch {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.tenantId !== "string" ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number"
  ) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  req.user = {
    sub: payload.sub,
    email: payload.email,
    tenantId: payload.tenantId,
    iat: payload.iat,
    exp: payload.exp,
  };

  next();
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUserPayload;
  }
}
