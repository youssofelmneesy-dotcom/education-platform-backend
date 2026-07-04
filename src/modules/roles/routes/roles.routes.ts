import { Router } from "express";

import { RolesController } from "../controllers/index.js";

export const rolesRouter = Router();
export const rolesController = new RolesController();
