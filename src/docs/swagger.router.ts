import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./openapi/index.js";

export const swaggerRouter = Router();

swaggerRouter.get("/openapi.json", (_req, res) => {
  res.status(200).json(openApiDocument);
});

swaggerRouter.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    explorer: true,
    customSiteTitle: "Education Platform API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);
