export class LessonNotFoundError extends Error {
  constructor() {
    super("Lesson not found");
    this.name = "LessonNotFoundError";
  }
}

export class DuplicateLessonSlugError extends Error {
  constructor() {
    super("Lesson with this slug already exists in this course");
    this.name = "DuplicateLessonSlugError";
  }
}

export class CourseNotFoundError extends Error {
  constructor() {
    super("Course not found");
    this.name = "CourseNotFoundError";
  }
}
