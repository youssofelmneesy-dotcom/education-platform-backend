import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { RolesController } from "../controllers/index.js";
import { createRoleSchema, updateRoleSchema } from "../validators/index.js";

export const rolesRouter = Router();
export const rolesController = new RolesController();

rolesRouter.use(authMiddleware);

rolesRouter.post("/", requirePermissions("roles:create"), validate({ body: createRoleSchema }), asyncHandler(rolesController.create));
rolesRouter.get("/", requirePermissions("roles:list"), asyncHandler(rolesController.list));
rolesRouter.get("/:id", requirePermissions("roles:read"), asyncHandler(rolesController.getById));
rolesRouter.patch("/:id", requirePermissions("roles:update"), validate({ body: updateRoleSchema }), asyncHandler(rolesController.updateById));
rolesRouter.delete("/:id", requirePermissions("roles:delete"), asyncHandler(rolesController.deleteById));
