import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { ProfilesController } from "../controllers/index.js";
import { updateProfileSchema } from "../validators/index.js";

export const profilesRouter = Router();
export const profilesController = new ProfilesController();

profilesRouter.use(authMiddleware);

profilesRouter.get("/me", asyncHandler(profilesController.getMyProfile));
profilesRouter.patch("/me", validate({ body: updateProfileSchema }), asyncHandler(profilesController.updateMyProfile));
