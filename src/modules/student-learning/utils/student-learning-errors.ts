import { AppError } from "../../../shared/errors/index.js";

export class LearningResourceNotFoundError extends AppError {
  constructor(message = "Learning resource not found") {
    super(message, 404, "LEARNING_RESOURCE_NOT_FOUND");
  }
}

export class LessonProgressNotSupportedError extends AppError {
  constructor() {
    super("Lesson progress is only supported for lessons with videos", 422, "LESSON_PROGRESS_NOT_SUPPORTED");
  }
}

export class LessonNoteNotFoundError extends AppError {
  constructor() {
    super("Lesson note not found", 404, "LESSON_NOTE_NOT_FOUND");
  }
}
