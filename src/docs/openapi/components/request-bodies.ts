export const commonRequestBodies = {
  ValidationDocumentedRequest: {
    description: "Endpoint-specific request body validated by Zod schemas in the corresponding module validator.",
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  },
} as const;
