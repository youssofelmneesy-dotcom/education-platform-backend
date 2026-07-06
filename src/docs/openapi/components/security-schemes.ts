export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT access token using the Authorization: Bearer <token> header.",
  },
} as const;
