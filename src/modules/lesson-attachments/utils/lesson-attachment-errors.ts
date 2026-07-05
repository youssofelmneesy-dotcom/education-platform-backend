export class LessonAttachmentNotFoundError extends Error {
  constructor() {
    super("Lesson attachment not found");
    this.name = "LessonAttachmentNotFoundError";
  }
}

export class LessonNotFoundError extends Error {
  constructor() {
    super("Lesson not found");
    this.name = "LessonNotFoundError";
  }
}
