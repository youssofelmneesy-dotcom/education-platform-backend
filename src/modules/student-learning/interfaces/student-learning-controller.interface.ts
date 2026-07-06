import type { Request, Response } from "express";

export interface IStudentLearningController {
  startLesson(req: Request, res: Response): Promise<void>;
  updateLessonProgress(req: Request, res: Response): Promise<void>;
  completeLesson(req: Request, res: Response): Promise<void>;
  markLessonIncomplete(req: Request, res: Response): Promise<void>;
  getLessonProgress(req: Request, res: Response): Promise<void>;
  getCourseProgress(req: Request, res: Response): Promise<void>;
  getRecentlyWatched(req: Request, res: Response): Promise<void>;
  getContinueWatching(req: Request, res: Response): Promise<void>;
  getLastWatchedInCourse(req: Request, res: Response): Promise<void>;
  createNote(req: Request, res: Response): Promise<void>;
  updateNote(req: Request, res: Response): Promise<void>;
  deleteNote(req: Request, res: Response): Promise<void>;
  listLessonNotes(req: Request, res: Response): Promise<void>;
  listMyNotes(req: Request, res: Response): Promise<void>;
  bookmarkCourse(req: Request, res: Response): Promise<void>;
  removeCourseBookmark(req: Request, res: Response): Promise<void>;
  bookmarkLesson(req: Request, res: Response): Promise<void>;
  removeLessonBookmark(req: Request, res: Response): Promise<void>;
  listBookmarks(req: Request, res: Response): Promise<void>;
  getDashboard(req: Request, res: Response): Promise<void>;
}
