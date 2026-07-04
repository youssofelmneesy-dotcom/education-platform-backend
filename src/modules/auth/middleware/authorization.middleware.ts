import type { NextFunction, Response } from "express";
import type { Request } from "express-serve-static-core";
import { prisma } from "../../../database/index.js";

export const requireRoles = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const userId = req.user.sub;
    const tenantId = req.user.tenantId;

    try {
      // Load user's roles from database
      const userRoles = await prisma.userRole.findMany({
        where: {
          tenantId,
          userId,
          deletedAt: null,
        },
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      const userRoleNames = userRoles.map((ur) => ur.role.name);

      // Check if user has at least one of the required roles
      const hasRequiredRole = requiredRoles.some((role) => userRoleNames.includes(role));

      if (!hasRequiredRole) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      // Attach user roles to request for downstream use
      req.userRoles = userRoleNames;

      next();
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
};

declare module "express-serve-static-core" {
  interface Request {
    userRoles?: string[];
  }
}
