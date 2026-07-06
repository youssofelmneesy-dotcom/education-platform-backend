import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { LessonsController } from "../controllers/index.js";
import { createLessonSchema, updateLessonSchema } from "../validators/index.js";

export const lessonsRouter = Router();
export const lessonsController = new LessonsController();

lessonsRouter.use(authMiddleware);

lessonsRouter.post("/:courseId/lessons", validate({ body: createLessonSchema }), asyncHandler(lessonsController.create));
lessonsRouter.get("/:courseId/lessons", asyncHandler(lessonsController.listByCourse));
lessonsRouter.get("/:courseId/lessons/:id", asyncHandler(lessonsController.getById));
lessonsRouter.patch("/:courseId/lessons/:id", validate({ body: updateLessonSchema }), asyncHandler(lessonsController.updateById));
lessonsRouter.delete("/:courseId/lessons/:id", asyncHandler(lessonsController.deleteById));
