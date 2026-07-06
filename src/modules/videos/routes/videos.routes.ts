import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { VideosController } from "../controllers/index.js";
import {
  createVideoChapterSchema,
  createVideoSchema,
  createVideoSubtitleSchema,
  lessonIdParamsSchema,
  updateVideoChapterSchema,
  updateVideoSchema,
  updateVideoSubtitleSchema,
  videoChapterParamsSchema,
  videoIdParamsSchema,
  videoListQuerySchema,
  videoSubtitleParamsSchema,
} from "../validators/index.js";

export const videosRouter = Router();
export const videosController = new VideosController();

videosRouter.use(authMiddleware);

videosRouter.get("/", validate({ query: videoListQuerySchema }), asyncHandler(videosController.list));
videosRouter.post("/", validate({ body: createVideoSchema }), asyncHandler(videosController.create));
videosRouter.get("/statistics", asyncHandler(videosController.getStatistics));
videosRouter.get("/lessons/:lessonId", validate({ params: lessonIdParamsSchema }), asyncHandler(videosController.listLessonVideos));

videosRouter.get("/:id/previous", validate({ params: videoIdParamsSchema }), asyncHandler(videosController.getPreviousVideo));
videosRouter.get("/:id/next", validate({ params: videoIdParamsSchema }), asyncHandler(videosController.getNextVideo));

videosRouter.post("/:id/chapters", validate({ params: videoIdParamsSchema, body: createVideoChapterSchema }), asyncHandler(videosController.createChapter));
videosRouter.get("/:id/chapters", validate({ params: videoIdParamsSchema }), asyncHandler(videosController.listChapters));
videosRouter.get("/:id/chapters/:chapterId", validate({ params: videoChapterParamsSchema }), asyncHandler(videosController.getChapterById));
videosRouter.patch(
  "/:id/chapters/:chapterId",
  validate({ params: videoChapterParamsSchema, body: updateVideoChapterSchema }),
  asyncHandler(videosController.updateChapter)
);
videosRouter.delete("/:id/chapters/:chapterId", validate({ params: videoChapterParamsSchema }), asyncHandler(videosController.deleteChapter));

videosRouter.post("/:id/subtitles", validate({ params: videoIdParamsSchema, body: createVideoSubtitleSchema }), asyncHandler(videosController.createSubtitle));
videosRouter.get("/:id/subtitles", validate({ params: videoIdParamsSchema }), asyncHandler(videosController.listSubtitles));
videosRouter.get("/:id/subtitles/:subtitleId", validate({ params: videoSubtitleParamsSchema }), asyncHandler(videosController.getSubtitleById));
videosRouter.patch(
  "/:id/subtitles/:subtitleId",
  validate({ params: videoSubtitleParamsSchema, body: updateVideoSubtitleSchema }),
  asyncHandler(videosController.updateSubtitle)
);
videosRouter.delete("/:id/subtitles/:subtitleId", validate({ params: videoSubtitleParamsSchema }), asyncHandler(videosController.deleteSubtitle));

videosRouter.get("/:id", validate({ params: videoIdParamsSchema }), asyncHandler(videosController.getById));
videosRouter.patch("/:id", validate({ params: videoIdParamsSchema, body: updateVideoSchema }), asyncHandler(videosController.updateById));
videosRouter.delete("/:id", validate({ params: videoIdParamsSchema }), asyncHandler(videosController.deleteById));
