import type { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { PaginationQueryDto, UpdateLessonProgressDto } from "../dto/index.js";
import type { IStudentLearningController, IStudentLearningService } from "../interfaces/index.js";
import { StudentLearningService } from "../services/index.js";

export class StudentLearningController implements IStudentLearningController {
  constructor(private readonly studentLearningService: IStudentLearningService = new StudentLearningService()) {}

  startLesson = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.startLesson(userId, tenantId, this.getParam(req, "lessonId"));
    sendSuccess(res, 200, "Lesson started successfully", data);
  };

  updateLessonProgress = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.updateLessonProgress(userId, tenantId, this.getParam(req, "lessonId"), req.body as UpdateLessonProgressDto);
    sendSuccess(res, 200, "Lesson progress updated successfully", data);
  };

  completeLesson = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.completeLesson(userId, tenantId, this.getParam(req, "lessonId"));
    sendSuccess(res, 200, "Lesson completed successfully", data);
  };

  markLessonIncomplete = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.markLessonIncomplete(userId, tenantId, this.getParam(req, "lessonId"));
    sendSuccess(res, 200, "Lesson marked incomplete successfully", data);
  };

  getLessonProgress = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.getLessonProgress(userId, tenantId, this.getParam(req, "lessonId"));
    sendSuccess(res, 200, "Lesson progress retrieved successfully", data);
  };

  getCourseProgress = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.getCourseProgress(userId, tenantId, this.getParam(req, "courseId"));
    sendSuccess(res, 200, "Course progress retrieved successfully", data);
  };

  getRecentlyWatched = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.getRecentlyWatched(userId, tenantId, Number(req.query.limit));
    sendSuccess(res, 200, "Recently watched lessons retrieved successfully", data);
  };

  getContinueWatching = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.getContinueWatching(userId, tenantId, Number(req.query.limit));
    sendSuccess(res, 200, "Continue watching lessons retrieved successfully", data);
  };

  getLastWatchedInCourse = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.getLastWatchedInCourse(userId, tenantId, this.getParam(req, "courseId"));
    sendSuccess(res, 200, "Last watched lesson retrieved successfully", data);
  };

  createNote = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.createNote(userId, tenantId, this.getParam(req, "lessonId"), req.body.content as string);
    sendSuccess(res, 201, "Lesson note created successfully", data);
  };

  updateNote = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.updateNote(userId, tenantId, this.getParam(req, "id"), req.body.content as string);
    sendSuccess(res, 200, "Lesson note updated successfully", data);
  };

  deleteNote = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    await this.studentLearningService.deleteNote(userId, tenantId, this.getParam(req, "id"));
    res.status(204).send();
  };

  listLessonNotes = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.listLessonNotes(userId, tenantId, this.getParam(req, "lessonId"), req.query as unknown as PaginationQueryDto);
    sendSuccess(res, 200, "Lesson notes retrieved successfully", data);
  };

  listMyNotes = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.listMyNotes(userId, tenantId, req.query as unknown as PaginationQueryDto);
    sendSuccess(res, 200, "Notes retrieved successfully", data);
  };

  bookmarkCourse = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.bookmarkCourse(userId, tenantId, this.getParam(req, "courseId"));
    sendSuccess(res, 201, "Course bookmarked successfully", data);
  };

  removeCourseBookmark = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    await this.studentLearningService.removeCourseBookmark(userId, tenantId, this.getParam(req, "courseId"));
    res.status(204).send();
  };

  bookmarkLesson = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.bookmarkLesson(userId, tenantId, this.getParam(req, "lessonId"));
    sendSuccess(res, 201, "Lesson bookmarked successfully", data);
  };

  removeLessonBookmark = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    await this.studentLearningService.removeLessonBookmark(userId, tenantId, this.getParam(req, "lessonId"));
    res.status(204).send();
  };

  listBookmarks = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.listBookmarks(userId, tenantId, req.query as unknown as PaginationQueryDto);
    sendSuccess(res, 200, "Bookmarks retrieved successfully", data);
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.studentLearningService.getDashboard(userId, tenantId);
    sendSuccess(res, 200, "Student dashboard retrieved successfully", data);
  };

  private getAuthContext(req: Request): { userId: string; tenantId: string } {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    return { userId: req.user.sub, tenantId: req.user.tenantId };
  }

  private getParam(req: Request, name: string): string {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
