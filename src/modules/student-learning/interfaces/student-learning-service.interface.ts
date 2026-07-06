import type { CourseProgressDto, PaginationQueryDto, StudentDashboardDto, UpdateLessonProgressDto } from "../dto/index.js";

export interface IStudentLearningService {
  startLesson(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  updateLessonProgress(userId: string, tenantId: string, lessonId: string, data: UpdateLessonProgressDto): Promise<unknown>;
  completeLesson(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  markLessonIncomplete(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  getLessonProgress(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  getCourseProgress(userId: string, tenantId: string, courseId: string): Promise<CourseProgressDto>;
  getRecentlyWatched(userId: string, tenantId: string, limit: number): Promise<unknown[]>;
  getContinueWatching(userId: string, tenantId: string, limit: number): Promise<unknown[]>;
  getLastWatchedInCourse(userId: string, tenantId: string, courseId: string): Promise<unknown | null>;
  createNote(userId: string, tenantId: string, lessonId: string, content: string): Promise<unknown>;
  updateNote(userId: string, tenantId: string, noteId: string, content: string): Promise<unknown>;
  deleteNote(userId: string, tenantId: string, noteId: string): Promise<void>;
  listLessonNotes(userId: string, tenantId: string, lessonId: string, query: PaginationQueryDto): Promise<unknown>;
  listMyNotes(userId: string, tenantId: string, query: PaginationQueryDto): Promise<unknown>;
  bookmarkCourse(userId: string, tenantId: string, courseId: string): Promise<unknown>;
  removeCourseBookmark(userId: string, tenantId: string, courseId: string): Promise<void>;
  bookmarkLesson(userId: string, tenantId: string, lessonId: string): Promise<unknown>;
  removeLessonBookmark(userId: string, tenantId: string, lessonId: string): Promise<void>;
  listBookmarks(userId: string, tenantId: string, query: PaginationQueryDto): Promise<unknown>;
  getDashboard(userId: string, tenantId: string): Promise<StudentDashboardDto>;
}
