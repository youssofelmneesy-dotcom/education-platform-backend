import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { AuthRepository } from "../repositories/index.js";
import { verifyJwt } from "../services/auth.service.js";
import type { AuthorizationContext } from "../types/index.js";

export interface AuthenticatedUserPayload {
  sub: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}

const authRepository = new AuthRepository();

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authorizationHeader = req.header("Authorization") ?? req.header("authorization");

  if (!authorizationHeader) {
    next(new UnauthorizedError());
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new UnauthorizedError());
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
    next(new UnauthorizedError());
    return;
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.tenantId !== "string" ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number"
  ) {
    next(new UnauthorizedError());
    return;
  }

  const user = {
    sub: payload.sub,
    email: payload.email,
    tenantId: payload.tenantId,
    iat: payload.iat,
    exp: payload.exp,
  };

  const authorizationContext = await authRepository.getAuthorizationContext(user.sub, user.tenantId, user);

  if (!authorizationContext) {
    next(new UnauthorizedError());
    return;
  }

  req.auth = authorizationContext;
  req.user = authorizationContext.user;
  req.userRoles = authorizationContext.roles;
  req.userPermissions = authorizationContext.permissions;

  next();
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUserPayload;
    auth?: AuthorizationContext;
    userRoles?: string[];
    userPermissions?: string[];
  }
}
