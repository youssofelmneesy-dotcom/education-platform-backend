import { apiMetadata } from "./api-metadata.js";
import { openApiComponents } from "./components/index.js";
import { modulePaths } from "./modules/index.js";
import { openApiServers } from "./servers.js";
import { openApiTags } from "./tags.js";

export const openApiDocument = {
  openapi: "3.1.0",
  info: apiMetadata,
  servers: openApiServers,
  tags: openApiTags,
  security: [{ bearerAuth: [] }],
  paths: modulePaths,
  components: openApiComponents,
} as const;
