import type { PaginationQueryDto, UpdateLessonProgressDto } from "../dto/index.js";

export interface IStudentLearningRepository {
  findLessonVideo(lessonId: string, tenantId: string): Promise<{ lessonId: string; courseId: string; videoId: string; videoDurationSeconds: number | null } | null>;
  startLesson(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  updateLessonProgress(userId: string, tenantId: string, lessonId: string, data: UpdateLessonProgressDto): Promise<unknown>;
  completeLesson(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  markLessonIncomplete(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  getLessonProgress(userId: string, tenantId: string, lessonId: string): Promise<unknown | null>;
  getCourseProgress(userId: string, tenantId: string, courseId: string): Promise<unknown>;
  getRecentlyWatched(userId: string, tenantId: string, limit: number): Promise<unknown[]>;
  getContinueWatching(userId: string, tenantId: string, limit: number): Promise<unknown[]>;
  getLastWatchedInCourse(userId: string, tenantId: string, courseId: string): Promise<unknown | null>;
  createNote(userId: string, tenantId: string, lessonId: string, content: string): Promise<unknown>;
  updateNote(userId: string, tenantId: string, noteId: string, content: string): Promise<unknown | null>;
  deleteNote(userId: string, tenantId: string, noteId: string): Promise<boolean>;
  listLessonNotes(userId: string, tenantId: string, lessonId: string, query: PaginationQueryDto): Promise<{ notes: unknown[]; total: number }>;
  listMyNotes(userId: string, tenantId: string, query: PaginationQueryDto): Promise<{ notes: unknown[]; total: number }>;
  bookmarkCourse(userId: string, tenantId: string, courseId: string): Promise<unknown>;
  removeCourseBookmark(userId: string, tenantId: string, courseId: string): Promise<void>;
  bookmarkLesson(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  removeLessonBookmark(userId: string, tenantId: string, lessonId: string): Promise<void>;
  listBookmarks(userId: string, tenantId: string, query: PaginationQueryDto): Promise<{ bookmarks: unknown[]; total: number }>;
  getDashboard(userId: string, tenantId: string): Promise<unknown>;
}
