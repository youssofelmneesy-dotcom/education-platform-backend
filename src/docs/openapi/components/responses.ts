export const commonResponses = {
  BadRequest: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  Unauthorized: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  Forbidden: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  NotFound: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  Conflict: {
    description: "Resource conflict",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  ValidationError: {
    description: "Validation failed",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
      },
    },
  },
  TooManyRequests: {
    description: "Too many requests",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  UnprocessableEntity: {
    description: "Request was syntactically valid but could not be processed by the domain rules",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  InternalServerError: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
} as const;
