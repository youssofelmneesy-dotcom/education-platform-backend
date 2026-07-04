import { Router } from "express";

import { authMiddleware, requireRoles } from "../../auth/middleware/index.js";
import { RolesController } from "../controllers/index.js";

export const rolesRouter = Router();
export const rolesController = new RolesController();

rolesRouter.use(authMiddleware);
rolesRouter.use(requireRoles("Admin"));

rolesRouter.post("/", rolesController.create);
rolesRouter.get("/", rolesController.list);
rolesRouter.get("/:id", rolesController.getById);
rolesRouter.patch("/:id", rolesController.updateById);
rolesRouter.delete("/:id", rolesController.deleteById);
