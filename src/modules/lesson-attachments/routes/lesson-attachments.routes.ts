import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { LessonAttachmentsController } from "../controllers/index.js";
import { createLessonAttachmentSchema, updateLessonAttachmentSchema } from "../validators/index.js";

export const lessonAttachmentsRouter = Router();
export const lessonAttachmentsController = new LessonAttachmentsController();

lessonAttachmentsRouter.use(authMiddleware);

lessonAttachmentsRouter.post("/", validate({ body: createLessonAttachmentSchema }), asyncHandler(lessonAttachmentsController.create));
lessonAttachmentsRouter.get("/", asyncHandler(lessonAttachmentsController.listByLesson));
lessonAttachmentsRouter.get("/:id", asyncHandler(lessonAttachmentsController.getById));
lessonAttachmentsRouter.patch("/:id", validate({ body: updateLessonAttachmentSchema }), asyncHandler(lessonAttachmentsController.updateById));
lessonAttachmentsRouter.delete("/:id", asyncHandler(lessonAttachmentsController.deleteById));
