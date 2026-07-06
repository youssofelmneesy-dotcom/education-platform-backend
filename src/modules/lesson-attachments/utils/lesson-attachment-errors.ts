import { AppError } from "../../../shared/errors/index.js";

export class LessonAttachmentNotFoundError extends AppError {
  constructor() {
    super("Lesson attachment not found", 404, "LESSON_ATTACHMENT_NOT_FOUND");
  }
}

export class LessonNotFoundError extends AppError {
  constructor() {
    super("Lesson not found", 404, "LESSON_NOT_FOUND");
  }
}
