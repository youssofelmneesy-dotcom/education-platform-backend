import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { LessonsController } from "../controllers/index.js";
import { createLessonSchema, updateLessonSchema } from "../validators/index.js";

export const lessonsRouter = Router();
export const lessonsController = new LessonsController();

lessonsRouter.use(authMiddleware);

lessonsRouter.post("/:courseId/lessons", requirePermissions("lessons:create"), validate({ body: createLessonSchema }), asyncHandler(lessonsController.create));
lessonsRouter.get("/:courseId/lessons", requirePermissions("lessons:list"), asyncHandler(lessonsController.listByCourse));
lessonsRouter.get("/:courseId/lessons/:id", requirePermissions("lessons:read"), asyncHandler(lessonsController.getById));
lessonsRouter.patch("/:courseId/lessons/:id", requirePermissions("lessons:update"), validate({ body: updateLessonSchema }), asyncHandler(lessonsController.updateById));
lessonsRouter.delete("/:courseId/lessons/:id", requirePermissions("lessons:delete"), asyncHandler(lessonsController.deleteById));
