import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { CategoriesController } from "../controllers/index.js";
import { createCategorySchema, updateCategorySchema } from "../validators/index.js";

export const categoriesRouter = Router();
export const categoriesController = new CategoriesController();

categoriesRouter.use(authMiddleware);

categoriesRouter.post("/", validate({ body: createCategorySchema }), asyncHandler(categoriesController.create));
categoriesRouter.get("/", asyncHandler(categoriesController.list));
categoriesRouter.get("/:id", asyncHandler(categoriesController.getById));
categoriesRouter.patch("/:id", validate({ body: updateCategorySchema }), asyncHandler(categoriesController.updateById));
categoriesRouter.delete("/:id", asyncHandler(categoriesController.deleteById));
