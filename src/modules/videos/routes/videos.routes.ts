import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { VideosController } from "../controllers/index.js";

export const videosRouter = Router();
export const videosController = new VideosController();

videosRouter.use(authMiddleware);

videosRouter.post("/", videosController.create);
videosRouter.get("/:id", videosController.getById);
videosRouter.patch("/:id", videosController.updateById);
videosRouter.delete("/:id", videosController.deleteById);
