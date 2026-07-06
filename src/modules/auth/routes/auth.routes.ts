import { Router } from "express";

import { asyncHandler } from "../../../shared/utils/index.js";
import { validate } from "../../../shared/middlewares/index.js";
import { AuthController } from "../controllers/index.js";
import { loginRequestSchema, logoutRequestSchema, refreshRequestSchema, registerRequestSchema } from "../validators/index.js";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", validate({ body: registerRequestSchema }), asyncHandler(authController.register));
authRouter.post("/login", validate({ body: loginRequestSchema }), asyncHandler(authController.login));
authRouter.post("/refresh", validate({ body: refreshRequestSchema }), asyncHandler(authController.refresh));
authRouter.post("/logout", validate({ body: logoutRequestSchema }), asyncHandler(authController.logout));
