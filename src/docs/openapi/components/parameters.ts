export const commonParameters = {
  PageQuery: {
    name: "page",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  LimitQuery: {
    name: "limit",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  SearchQuery: {
    name: "search",
    in: "query",
    required: false,
    schema: { type: "string", minLength: 1 },
  },
  IdPath: {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" },
  },
} as const;
