export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor() {
    super("Email already exists", 409);
  }
}
