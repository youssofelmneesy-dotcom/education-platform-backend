export class TagNotFoundError extends Error {
  constructor() {
    super("Tag not found");
    this.name = "TagNotFoundError";
  }
}

export class DuplicateTagSlugError extends Error {
  constructor() {
    super("Tag with this slug already exists");
    this.name = "DuplicateTagSlugError";
  }
}
