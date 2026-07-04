import { Router } from "express";
import { authMiddleware } from "../../auth/middleware/index.js";
import { UsersController } from "../controllers/index.js";

export const usersRouter = Router();
export const usersController = new UsersController();

usersRouter.use(authMiddleware);

usersRouter.get("/", usersController.list);
usersRouter.get("/:id", usersController.getById);
usersRouter.patch("/:id", usersController.updateById);
usersRouter.delete("/:id", usersController.deleteById);
