export const commonSchemas = {
  SuccessResponse: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
      data: {
        nullable: true,
        description: "Response payload. Shape depends on the endpoint.",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      errors: {
        nullable: true,
        description: "Optional validation or domain error details.",
      },
    },
  },
  ValidationErrorResponse: {
    type: "object",
    required: ["success", "message", "errors"],
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      errors: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  PaginationMeta: {
    type: "object",
    required: ["total", "page", "limit"],
    properties: {
      total: { type: "integer", minimum: 0 },
      page: { type: "integer", minimum: 1 },
      limit: { type: "integer", minimum: 1 },
    },
  },
} as const;
