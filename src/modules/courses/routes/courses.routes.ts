import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { CoursesController } from "../controllers/index.js";
import { createCourseSchema, updateCourseSchema } from "../validators/index.js";

export const coursesRouter = Router();
export const coursesController = new CoursesController();

coursesRouter.use(authMiddleware);

coursesRouter.post("/", validate({ body: createCourseSchema }), asyncHandler(coursesController.create));
coursesRouter.get("/", asyncHandler(coursesController.list));
coursesRouter.get("/:id", asyncHandler(coursesController.getById));
coursesRouter.patch("/:id", validate({ body: updateCourseSchema }), asyncHandler(coursesController.updateById));
coursesRouter.delete("/:id", asyncHandler(coursesController.deleteById));
