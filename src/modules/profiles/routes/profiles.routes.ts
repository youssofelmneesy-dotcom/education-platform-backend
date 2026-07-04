import { Router } from "express";

import { ProfilesController } from "../controllers/index.js";

export const profilesRouter = Router();
export const profilesController = new ProfilesController();
