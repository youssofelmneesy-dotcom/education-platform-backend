import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { PermissionsController } from "../controllers/index.js";
import { createPermissionSchema, updatePermissionSchema } from "../validators/index.js";

export const permissionsRouter = Router();
export const permissionsController = new PermissionsController();

permissionsRouter.use(authMiddleware);

permissionsRouter.post("/", requirePermissions("permissions:create"), validate({ body: createPermissionSchema }), asyncHandler(permissionsController.create));
permissionsRouter.get("/", requirePermissions("permissions:list"), asyncHandler(permissionsController.list));
permissionsRouter.get("/:id", requirePermissions("permissions:read"), asyncHandler(permissionsController.getById));
permissionsRouter.patch("/:id", requirePermissions("permissions:update"), validate({ body: updatePermissionSchema }), asyncHandler(permissionsController.updateById));
permissionsRouter.delete("/:id", requirePermissions("permissions:delete"), asyncHandler(permissionsController.deleteById));
