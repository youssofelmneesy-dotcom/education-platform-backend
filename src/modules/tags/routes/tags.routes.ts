import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { TagsController } from "../controllers/index.js";

export const tagsRouter = Router();
export const tagsController = new TagsController();

tagsRouter.use(authMiddleware);

tagsRouter.post("/", tagsController.create);
tagsRouter.get("/", tagsController.list);
tagsRouter.get("/:id", tagsController.getById);
tagsRouter.patch("/:id", tagsController.updateById);
tagsRouter.delete("/:id", tagsController.deleteById);
