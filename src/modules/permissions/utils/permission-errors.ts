export class PermissionNotFoundError extends Error {
  constructor() {
    super("Permission not found");
    this.name = "PermissionNotFoundError";
  }
}

export class DuplicatePermissionError extends Error {
  constructor() {
    super("Permission with this resource and action already exists");
    this.name = "DuplicatePermissionError";
  }
}
