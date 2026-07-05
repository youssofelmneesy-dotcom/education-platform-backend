import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { LessonAttachmentsController } from "../controllers/index.js";

export const lessonAttachmentsRouter = Router();
export const lessonAttachmentsController = new LessonAttachmentsController();

lessonAttachmentsRouter.use(authMiddleware);

lessonAttachmentsRouter.post("/", lessonAttachmentsController.create);
lessonAttachmentsRouter.get("/", lessonAttachmentsController.listByLesson);
lessonAttachmentsRouter.get("/:id", lessonAttachmentsController.getById);
lessonAttachmentsRouter.patch("/:id", lessonAttachmentsController.updateById);
lessonAttachmentsRouter.delete("/:id", lessonAttachmentsController.deleteById);
