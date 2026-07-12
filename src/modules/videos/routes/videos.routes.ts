import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
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

videosRouter.get("/", requirePermissions("videos:list"), validate({ query: videoListQuerySchema }), asyncHandler(videosController.list));
videosRouter.post("/", requirePermissions("videos:create"), validate({ body: createVideoSchema }), asyncHandler(videosController.create));
videosRouter.get("/statistics", requirePermissions("videos:read"), asyncHandler(videosController.getStatistics));
videosRouter.get("/lessons/:lessonId", requirePermissions("videos:list"), validate({ params: lessonIdParamsSchema }), asyncHandler(videosController.listLessonVideos));

videosRouter.get("/:id/previous", requirePermissions("videos:read"), validate({ params: videoIdParamsSchema }), asyncHandler(videosController.getPreviousVideo));
videosRouter.get("/:id/next", requirePermissions("videos:read"), validate({ params: videoIdParamsSchema }), asyncHandler(videosController.getNextVideo));

videosRouter.post("/:id/chapters", requirePermissions("videos:update"), validate({ params: videoIdParamsSchema, body: createVideoChapterSchema }), asyncHandler(videosController.createChapter));
videosRouter.get("/:id/chapters", requirePermissions("videos:read"), validate({ params: videoIdParamsSchema }), asyncHandler(videosController.listChapters));
videosRouter.get("/:id/chapters/:chapterId", requirePermissions("videos:read"), validate({ params: videoChapterParamsSchema }), asyncHandler(videosController.getChapterById));
videosRouter.patch(
  "/:id/chapters/:chapterId",
  requirePermissions("videos:update"),
  validate({ params: videoChapterParamsSchema, body: updateVideoChapterSchema }),
  asyncHandler(videosController.updateChapter)
);
videosRouter.delete("/:id/chapters/:chapterId", requirePermissions("videos:update"), validate({ params: videoChapterParamsSchema }), asyncHandler(videosController.deleteChapter));

videosRouter.post("/:id/subtitles", requirePermissions("videos:update"), validate({ params: videoIdParamsSchema, body: createVideoSubtitleSchema }), asyncHandler(videosController.createSubtitle));
videosRouter.get("/:id/subtitles", requirePermissions("videos:read"), validate({ params: videoIdParamsSchema }), asyncHandler(videosController.listSubtitles));
videosRouter.get("/:id/subtitles/:subtitleId", requirePermissions("videos:read"), validate({ params: videoSubtitleParamsSchema }), asyncHandler(videosController.getSubtitleById));
videosRouter.patch(
  "/:id/subtitles/:subtitleId",
  requirePermissions("videos:update"),
  validate({ params: videoSubtitleParamsSchema, body: updateVideoSubtitleSchema }),
  asyncHandler(videosController.updateSubtitle)
);
videosRouter.delete("/:id/subtitles/:subtitleId", requirePermissions("videos:update"), validate({ params: videoSubtitleParamsSchema }), asyncHandler(videosController.deleteSubtitle));

videosRouter.get("/:id", requirePermissions("videos:read"), validate({ params: videoIdParamsSchema }), asyncHandler(videosController.getById));
videosRouter.patch("/:id", requirePermissions("videos:update"), validate({ params: videoIdParamsSchema, body: updateVideoSchema }), asyncHandler(videosController.updateById));
videosRouter.delete("/:id", requirePermissions("videos:delete"), validate({ params: videoIdParamsSchema }), asyncHandler(videosController.deleteById));
