import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { ProfilesController } from "../controllers/index.js";

export const profilesRouter = Router();
export const profilesController = new ProfilesController();

profilesRouter.use(authMiddleware);

profilesRouter.get("/me", profilesController.getMyProfile);
profilesRouter.patch("/me", profilesController.updateMyProfile);
