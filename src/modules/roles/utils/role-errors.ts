import { AppError } from "../../../shared/errors/index.js";

export class RoleNotFoundError extends AppError {
  constructor() {
    super("Role not found", 404, "ROLE_NOT_FOUND");
  }
}

export class DuplicateRoleNameError extends AppError {
  constructor() {
    super("Role with this name already exists", 409, "DUPLICATE_ROLE_NAME");
  }
}
