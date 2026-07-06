import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { TagsController } from "../controllers/index.js";
import { createTagSchema, updateTagSchema } from "../validators/index.js";

export const tagsRouter = Router();
export const tagsController = new TagsController();

tagsRouter.use(authMiddleware);

tagsRouter.post("/", validate({ body: createTagSchema }), asyncHandler(tagsController.create));
tagsRouter.get("/", asyncHandler(tagsController.list));
tagsRouter.get("/:id", asyncHandler(tagsController.getById));
tagsRouter.patch("/:id", validate({ body: updateTagSchema }), asyncHandler(tagsController.updateById));
tagsRouter.delete("/:id", asyncHandler(tagsController.deleteById));
