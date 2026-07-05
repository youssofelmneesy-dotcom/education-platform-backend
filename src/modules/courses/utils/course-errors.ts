export class CourseNotFoundError extends Error {
  constructor() {
    super("Course not found");
    this.name = "CourseNotFoundError";
  }
}

export class DuplicateCourseSlugError extends Error {
  constructor() {
    super("Course with this slug already exists");
    this.name = "DuplicateCourseSlugError";
  }
}
