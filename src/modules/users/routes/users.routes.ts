import { Router } from "express";
import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { UsersController } from "../controllers/index.js";
import { updateUserSchema } from "../validators/index.js";

export const usersRouter = Router();
export const usersController = new UsersController();

usersRouter.use(authMiddleware);

usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.get("/:id", asyncHandler(usersController.getById));
usersRouter.patch("/:id", validate({ body: updateUserSchema }), asyncHandler(usersController.updateById));
usersRouter.delete("/:id", asyncHandler(usersController.deleteById));
