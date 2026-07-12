import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { CategoriesController } from "../controllers/index.js";
import { createCategorySchema, updateCategorySchema } from "../validators/index.js";

export const categoriesRouter = Router();
export const categoriesController = new CategoriesController();

categoriesRouter.use(authMiddleware);

categoriesRouter.post("/", requirePermissions("categories:create"), validate({ body: createCategorySchema }), asyncHandler(categoriesController.create));
categoriesRouter.get("/", requirePermissions("categories:list"), asyncHandler(categoriesController.list));
categoriesRouter.get("/:id", requirePermissions("categories:read"), asyncHandler(categoriesController.getById));
categoriesRouter.patch("/:id", requirePermissions("categories:update"), validate({ body: updateCategorySchema }), asyncHandler(categoriesController.updateById));
categoriesRouter.delete("/:id", requirePermissions("categories:delete"), asyncHandler(categoriesController.deleteById));
