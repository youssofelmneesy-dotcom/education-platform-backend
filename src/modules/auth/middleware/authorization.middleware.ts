import type { NextFunction, Response } from "express";
import type { Request } from "express-serve-static-core";
import { ForbiddenAppError, UnauthorizedError } from "../../../shared/errors/index.js";
import { hasAnyRole, hasPermissions } from "../utils/index.js";

export const requireRoles = (...requiredRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    const userRoleNames = req.auth?.roles ?? req.userRoles ?? [];
    const hasRequiredRole = hasAnyRole(userRoleNames, requiredRoles);

    if (!hasRequiredRole) {
      next(new ForbiddenAppError());
      return;
    }

    next();
  };
};

export const requirePermissions = (...requiredPermissions: string[]) => requireAllPermissions(...requiredPermissions);

export const requireAnyPermission = (...requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (!hasPermissions(req.auth?.permissions ?? req.userPermissions ?? [], requiredPermissions, "any")) {
      next(new ForbiddenAppError());
      return;
    }

    next();
  };
};

export const requireAllPermissions = (...requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (!hasPermissions(req.auth?.permissions ?? req.userPermissions ?? [], requiredPermissions, "all")) {
      next(new ForbiddenAppError());
      return;
    }

    next();
  };
};
