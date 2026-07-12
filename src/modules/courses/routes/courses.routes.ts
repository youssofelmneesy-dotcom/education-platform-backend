import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { CoursesController } from "../controllers/index.js";
import { createCourseSchema, updateCourseSchema } from "../validators/index.js";

export const coursesRouter = Router();
export const coursesController = new CoursesController();

coursesRouter.use(authMiddleware);

coursesRouter.post("/", requirePermissions("courses:create"), validate({ body: createCourseSchema }), asyncHandler(coursesController.create));
coursesRouter.get("/", requirePermissions("courses:list"), asyncHandler(coursesController.list));
coursesRouter.get("/:id", requirePermissions("courses:read"), asyncHandler(coursesController.getById));
coursesRouter.patch("/:id", requirePermissions("courses:update"), validate({ body: updateCourseSchema }), asyncHandler(coursesController.updateById));
coursesRouter.delete("/:id", requirePermissions("courses:delete"), asyncHandler(coursesController.deleteById));
