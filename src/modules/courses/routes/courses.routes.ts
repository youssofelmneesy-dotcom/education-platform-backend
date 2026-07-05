import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { CoursesController } from "../controllers/index.js";

export const coursesRouter = Router();
export const coursesController = new CoursesController();

coursesRouter.use(authMiddleware);

coursesRouter.post("/", coursesController.create);
coursesRouter.get("/", coursesController.list);
coursesRouter.get("/:id", coursesController.getById);
coursesRouter.patch("/:id", coursesController.updateById);
coursesRouter.delete("/:id", coursesController.deleteById);
