import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { StudentLearningController } from "../controllers/index.js";
import {
  courseIdParamsSchema,
  lessonIdParamsSchema,
  lessonNoteSchema,
  limitQuerySchema,
  noteIdParamsSchema,
  paginationQuerySchema,
  updateLessonProgressSchema,
} from "../validators/index.js";

export const studentLearningRouter = Router();
export const studentLearningController = new StudentLearningController();

studentLearningRouter.use(authMiddleware);

studentLearningRouter.get("/dashboard", asyncHandler(studentLearningController.getDashboard));

studentLearningRouter.get("/continue-watching", validate({ query: limitQuerySchema }), asyncHandler(studentLearningController.getContinueWatching));
studentLearningRouter.get("/watch-history/recent", validate({ query: limitQuerySchema }), asyncHandler(studentLearningController.getRecentlyWatched));

studentLearningRouter.get("/notes", validate({ query: paginationQuerySchema }), asyncHandler(studentLearningController.listMyNotes));
studentLearningRouter.patch("/notes/:id", validate({ params: noteIdParamsSchema, body: lessonNoteSchema }), asyncHandler(studentLearningController.updateNote));
studentLearningRouter.delete("/notes/:id", validate({ params: noteIdParamsSchema }), asyncHandler(studentLearningController.deleteNote));

studentLearningRouter.get("/bookmarks", validate({ query: paginationQuerySchema }), asyncHandler(studentLearningController.listBookmarks));

studentLearningRouter.get("/courses/:courseId/progress", validate({ params: courseIdParamsSchema }), asyncHandler(studentLearningController.getCourseProgress));
studentLearningRouter.get("/courses/:courseId/last-watched", validate({ params: courseIdParamsSchema }), asyncHandler(studentLearningController.getLastWatchedInCourse));
studentLearningRouter.post("/courses/:courseId/bookmark", validate({ params: courseIdParamsSchema }), asyncHandler(studentLearningController.bookmarkCourse));
studentLearningRouter.delete("/courses/:courseId/bookmark", validate({ params: courseIdParamsSchema }), asyncHandler(studentLearningController.removeCourseBookmark));

studentLearningRouter.post("/lessons/:lessonId/start", validate({ params: lessonIdParamsSchema }), asyncHandler(studentLearningController.startLesson));
studentLearningRouter.patch(
  "/lessons/:lessonId/progress",
  validate({ params: lessonIdParamsSchema, body: updateLessonProgressSchema }),
  asyncHandler(studentLearningController.updateLessonProgress)
);
studentLearningRouter.post("/lessons/:lessonId/complete", validate({ params: lessonIdParamsSchema }), asyncHandler(studentLearningController.completeLesson));
studentLearningRouter.post("/lessons/:lessonId/incomplete", validate({ params: lessonIdParamsSchema }), asyncHandler(studentLearningController.markLessonIncomplete));
studentLearningRouter.get("/lessons/:lessonId/progress", validate({ params: lessonIdParamsSchema }), asyncHandler(studentLearningController.getLessonProgress));
studentLearningRouter.post("/lessons/:lessonId/notes", validate({ params: lessonIdParamsSchema, body: lessonNoteSchema }), asyncHandler(studentLearningController.createNote));
studentLearningRouter.get(
  "/lessons/:lessonId/notes",
  validate({ params: lessonIdParamsSchema, query: paginationQuerySchema }),
  asyncHandler(studentLearningController.listLessonNotes)
);
studentLearningRouter.post("/lessons/:lessonId/bookmark", validate({ params: lessonIdParamsSchema }), asyncHandler(studentLearningController.bookmarkLesson));
studentLearningRouter.delete("/lessons/:lessonId/bookmark", validate({ params: lessonIdParamsSchema }), asyncHandler(studentLearningController.removeLessonBookmark));
