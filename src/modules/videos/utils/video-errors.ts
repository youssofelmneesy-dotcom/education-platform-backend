export class VideoNotFoundError extends Error {
  constructor() {
    super("Video not found");
    this.name = "VideoNotFoundError";
  }
}

export class LessonNotFoundError extends Error {
  constructor() {
    super("Lesson not found");
    this.name = "LessonNotFoundError";
  }
}

export class VideoAlreadyExistsForLessonError extends Error {
  constructor() {
    super("A video already exists for this lesson");
    this.name = "VideoAlreadyExistsForLessonError";
  }
}
