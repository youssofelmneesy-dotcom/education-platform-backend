import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { CategoriesController } from "../controllers/index.js";

export const categoriesRouter = Router();
export const categoriesController = new CategoriesController();

categoriesRouter.use(authMiddleware);

categoriesRouter.post("/", categoriesController.create);
categoriesRouter.get("/", categoriesController.list);
categoriesRouter.get("/:id", categoriesController.getById);
categoriesRouter.patch("/:id", categoriesController.updateById);
categoriesRouter.delete("/:id", categoriesController.deleteById);
