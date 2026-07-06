import { AppError } from "../../../shared/errors/index.js";

export class TagNotFoundError extends AppError {
  constructor() {
    super("Tag not found", 404, "TAG_NOT_FOUND");
  }
}

export class DuplicateTagSlugError extends AppError {
  constructor() {
    super("Tag with this slug already exists", 409, "DUPLICATE_TAG_SLUG");
  }
}
