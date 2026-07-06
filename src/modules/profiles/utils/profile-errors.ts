import { AppError } from "../../../shared/errors/index.js";

export class ProfileNotFoundError extends AppError {
  constructor() {
    super("Profile not found", 404, "PROFILE_NOT_FOUND");
  }
}
