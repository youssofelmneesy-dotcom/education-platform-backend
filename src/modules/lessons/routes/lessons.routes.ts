import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/index.js";
import { LessonsController } from "../controllers/index.js";

export const lessonsRouter = Router();
export const lessonsController = new LessonsController();

lessonsRouter.use(authMiddleware);

lessonsRouter.post("/:courseId/lessons", lessonsController.create);
lessonsRouter.get("/:courseId/lessons", lessonsController.listByCourse);
lessonsRouter.get("/:courseId/lessons/:id", lessonsController.getById);
lessonsRouter.patch("/:courseId/lessons/:id", lessonsController.updateById);
lessonsRouter.delete("/:courseId/lessons/:id", lessonsController.deleteById);
