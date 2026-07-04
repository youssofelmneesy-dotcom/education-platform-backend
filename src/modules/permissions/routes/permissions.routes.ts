import { Router } from "express";

import { PermissionsController } from "../controllers/index.js";

export const permissionsRouter = Router();
export const permissionsController = new PermissionsController();
