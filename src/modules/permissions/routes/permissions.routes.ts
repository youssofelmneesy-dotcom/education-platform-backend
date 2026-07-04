import { Router } from "express";

import { authMiddleware, requireRoles } from "../../auth/middleware/index.js";
import { PermissionsController } from "../controllers/index.js";

export const permissionsRouter = Router();
export const permissionsController = new PermissionsController();

permissionsRouter.use(authMiddleware);
permissionsRouter.use(requireRoles("Admin"));

permissionsRouter.post("/", permissionsController.create);
permissionsRouter.get("/", permissionsController.list);
permissionsRouter.get("/:id", permissionsController.getById);
permissionsRouter.patch("/:id", permissionsController.updateById);
permissionsRouter.delete("/:id", permissionsController.deleteById);
