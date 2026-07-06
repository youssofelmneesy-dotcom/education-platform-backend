import { AppError } from "../../../shared/errors/index.js";

export class AuthError extends AppError {
  constructor(message: string, statusCode: number, errorCode = "AUTH_ERROR") {
    super(message, statusCode, errorCode);
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor() {
    super("Email already exists", 409, "EMAIL_ALREADY_EXISTS");
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
}
