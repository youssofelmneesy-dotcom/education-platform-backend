import { AppError } from "../../../shared/errors/index.js";

export class PermissionNotFoundError extends AppError {
  constructor() {
    super("Permission not found", 404, "PERMISSION_NOT_FOUND");
  }
}

export class DuplicatePermissionError extends AppError {
  constructor() {
    super("Permission with this resource and action already exists", 409, "DUPLICATE_PERMISSION");
  }
}
