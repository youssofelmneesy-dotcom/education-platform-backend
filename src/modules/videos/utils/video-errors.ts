import { AppError } from "../../../shared/errors/index.js";

export class VideoNotFoundError extends AppError {
  constructor() {
    super("Video not found", 404, "VIDEO_NOT_FOUND");
  }
}

export class LessonNotFoundError extends AppError {
  constructor() {
    super("Lesson not found", 404, "LESSON_NOT_FOUND");
  }
}

export class VideoAlreadyExistsForLessonError extends AppError {
  constructor() {
    super("A video already exists for this lesson", 409, "VIDEO_ALREADY_EXISTS_FOR_LESSON");
  }
}

export class VideoChapterNotFoundError extends AppError {
  constructor() {
    super("Video chapter not found", 404, "VIDEO_CHAPTER_NOT_FOUND");
  }
}

export class VideoSubtitleNotFoundError extends AppError {
  constructor() {
    super("Video subtitle not found", 404, "VIDEO_SUBTITLE_NOT_FOUND");
  }
}
