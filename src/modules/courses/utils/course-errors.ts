import { AppError } from "../../../shared/errors/index.js";

export class CourseNotFoundError extends AppError {
  constructor() {
    super("Course not found", 404, "COURSE_NOT_FOUND");
  }
}

export class DuplicateCourseSlugError extends AppError {
  constructor() {
    super("Course with this slug already exists", 409, "DUPLICATE_COURSE_SLUG");
  }
}
