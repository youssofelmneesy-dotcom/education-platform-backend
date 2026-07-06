import { AppError } from "../../../shared/errors/index.js";

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "RESOURCE_NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super("Forbidden", 403, "FORBIDDEN");
  }
}
