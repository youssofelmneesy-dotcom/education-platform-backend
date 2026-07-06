import { AppError } from "../../../shared/errors/index.js";

export class LessonNotFoundError extends AppError {
  constructor() {
    super("Lesson not found", 404, "LESSON_NOT_FOUND");
  }
}

export class DuplicateLessonSlugError extends AppError {
  constructor() {
    super("Lesson with this slug already exists in this course", 409, "DUPLICATE_LESSON_SLUG");
  }
}

export class CourseNotFoundError extends AppError {
  constructor() {
    super("Course not found", 404, "COURSE_NOT_FOUND");
  }
}
