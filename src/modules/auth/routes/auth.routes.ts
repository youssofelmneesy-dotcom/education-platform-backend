import { Router } from "express";

import { AuthController } from "../controllers/index.js";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
