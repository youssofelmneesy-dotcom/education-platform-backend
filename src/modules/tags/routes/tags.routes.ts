import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { TagsController } from "../controllers/index.js";
import { createTagSchema, updateTagSchema } from "../validators/index.js";

export const tagsRouter = Router();
export const tagsController = new TagsController();

tagsRouter.use(authMiddleware);

tagsRouter.post("/", requirePermissions("tags:create"), validate({ body: createTagSchema }), asyncHandler(tagsController.create));
tagsRouter.get("/", requirePermissions("tags:list"), asyncHandler(tagsController.list));
tagsRouter.get("/:id", requirePermissions("tags:read"), asyncHandler(tagsController.getById));
tagsRouter.patch("/:id", requirePermissions("tags:update"), validate({ body: updateTagSchema }), asyncHandler(tagsController.updateById));
tagsRouter.delete("/:id", requirePermissions("tags:delete"), asyncHandler(tagsController.deleteById));
