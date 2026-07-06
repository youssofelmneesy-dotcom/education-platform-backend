import { commonParameters } from "./parameters.js";
import { commonRequestBodies } from "./request-bodies.js";
import { commonResponses } from "./responses.js";
import { commonSchemas } from "./schemas.js";
import { securitySchemes } from "./security-schemes.js";

export const openApiComponents = {
  securitySchemes,
  schemas: commonSchemas,
  responses: commonResponses,
  parameters: commonParameters,
  requestBodies: commonRequestBodies,
} as const;
