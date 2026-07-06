import type {
  BookmarkDto,
  BookmarksListDto,
  CourseProgressDto,
  LessonNoteDto,
  LessonProgressDto,
  NotesListDto,
  PaginationQueryDto,
  StudentDashboardDto,
  UpdateLessonProgressDto,
  WatchedLessonDto,
} from "../dto/index.js";
import type { IStudentLearningRepository, IStudentLearningService } from "../interfaces/index.js";
import { StudentLearningRepository } from "../repositories/index.js";
import type { BookmarkRecord, CourseProgressRecord, DashboardRecord, LessonNoteRecord, LessonProgressRecord, WatchedLessonRecord } from "../types/index.js";
import { LearningResourceNotFoundError, LessonNoteNotFoundError, LessonProgressNotSupportedError } from "../utils/index.js";

export class StudentLearningService implements IStudentLearningService {
  constructor(private readonly studentLearningRepository: IStudentLearningRepository = new StudentLearningRepository()) {}

  async startLesson(userId: string, tenantId: string, lessonId: string): Promise<LessonProgressDto> {
    const progress = await this.studentLearningRepository.startLesson(userId, tenantId, lessonId);
    return this.requireProgress(progress);
  }

  async updateLessonProgress(userId: string, tenantId: string, lessonId: string, data: UpdateLessonProgressDto): Promise<LessonProgressDto> {
    const progress = await this.studentLearningRepository.updateLessonProgress(userId, tenantId, lessonId, data);
    return this.requireProgress(progress);
  }

  async completeLesson(userId: string, tenantId: string, lessonId: string): Promise<LessonProgressDto> {
    const progress = await this.studentLearningRepository.completeLesson(userId, tenantId, lessonId);
    return this.requireProgress(progress);
  }

  async markLessonIncomplete(userId: string, tenantId: string, lessonId: string): Promise<LessonProgressDto> {
    const progress = await this.studentLearningRepository.markLessonIncomplete(userId, tenantId, lessonId);
    return this.requireProgress(progress);
  }

  async getLessonProgress(userId: string, tenantId: string, lessonId: string): Promise<LessonProgressDto> {
    const lessonVideo = await this.studentLearningRepository.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      throw new LessonProgressNotSupportedError();
    }

    const progress = (await this.studentLearningRepository.getLessonProgress(userId, tenantId, lessonId)) as LessonProgressRecord | null;

    if (!progress) {
      return {
        lessonId: lessonVideo.lessonId,
        courseId: lessonVideo.courseId,
        videoId: lessonVideo.videoId,
        watchedSeconds: 0,
        progressPercent: 0,
        completedAt: null,
        lastWatchedAt: null,
      };
    }

    return this.mapProgress(progress);
  }

  async getCourseProgress(userId: string, tenantId: string, courseId: string): Promise<CourseProgressDto> {
    const progress = (await this.studentLearningRepository.getCourseProgress(userId, tenantId, courseId)) as CourseProgressRecord;
    const remainingLessons = Math.max(progress.totalLessons - progress.completedLessons, 0);
    const progressPercentage = progress.totalLessons > 0 ? Math.round((progress.completedLessons / progress.totalLessons) * 100) : 0;

    return {
      courseId: progress.courseId,
      totalLessons: progress.totalLessons,
      completedLessons: progress.completedLessons,
      remainingLessons,
      progressPercentage,
    };
  }

  async getRecentlyWatched(userId: string, tenantId: string, limit: number): Promise<WatchedLessonDto[]> {
    const lessons = (await this.studentLearningRepository.getRecentlyWatched(userId, tenantId, limit)) as WatchedLessonRecord[];
    return lessons.map((lesson) => this.mapWatchedLesson(lesson));
  }

  async getContinueWatching(userId: string, tenantId: string, limit: number): Promise<LessonProgressDto[]> {
    const lessons = (await this.studentLearningRepository.getContinueWatching(userId, tenantId, limit)) as LessonProgressRecord[];
    return lessons.map((lesson) => this.mapProgress(lesson));
  }

  async getLastWatchedInCourse(userId: string, tenantId: string, courseId: string): Promise<WatchedLessonDto | null> {
    const lesson = (await this.studentLearningRepository.getLastWatchedInCourse(userId, tenantId, courseId)) as WatchedLessonRecord | null;
    return lesson ? this.mapWatchedLesson(lesson) : null;
  }

  async createNote(userId: string, tenantId: string, lessonId: string, content: string): Promise<LessonNoteDto> {
    const lessonVideo = await this.studentLearningRepository.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      throw new LearningResourceNotFoundError("Lesson not found");
    }

    const note = (await this.studentLearningRepository.createNote(userId, tenantId, lessonId, content)) as LessonNoteRecord;
    return this.mapNote(note);
  }

  async updateNote(userId: string, tenantId: string, noteId: string, content: string): Promise<LessonNoteDto> {
    const note = (await this.studentLearningRepository.updateNote(userId, tenantId, noteId, content)) as LessonNoteRecord | null;

    if (!note) {
      throw new LessonNoteNotFoundError();
    }

    return this.mapNote(note);
  }

  async deleteNote(userId: string, tenantId: string, noteId: string): Promise<void> {
    const deleted = await this.studentLearningRepository.deleteNote(userId, tenantId, noteId);

    if (!deleted) {
      throw new LessonNoteNotFoundError();
    }
  }

  async listLessonNotes(userId: string, tenantId: string, lessonId: string, query: PaginationQueryDto): Promise<NotesListDto> {
    const result = await this.studentLearningRepository.listLessonNotes(userId, tenantId, lessonId, query);
    const notes = result.notes as LessonNoteRecord[];

    return {
      notes: notes.map((note) => this.mapNote(note)),
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async listMyNotes(userId: string, tenantId: string, query: PaginationQueryDto): Promise<NotesListDto> {
    const result = await this.studentLearningRepository.listMyNotes(userId, tenantId, query);
    const notes = result.notes as LessonNoteRecord[];

    return {
      notes: notes.map((note) => this.mapNote(note)),
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async bookmarkCourse(userId: string, tenantId: string, courseId: string): Promise<BookmarkDto> {
    const bookmark = (await this.studentLearningRepository.bookmarkCourse(userId, tenantId, courseId)) as BookmarkRecord;
    return this.mapBookmark(bookmark);
  }

  async removeCourseBookmark(userId: string, tenantId: string, courseId: string): Promise<void> {
    await this.studentLearningRepository.removeCourseBookmark(userId, tenantId, courseId);
  }

  async bookmarkLesson(userId: string, tenantId: string, lessonId: string): Promise<BookmarkDto> {
    const bookmark = (await this.studentLearningRepository.bookmarkLesson(userId, tenantId, lessonId)) as BookmarkRecord | null;

    if (!bookmark) {
      throw new LearningResourceNotFoundError("Lesson not found");
    }

    return this.mapBookmark(bookmark);
  }

  async removeLessonBookmark(userId: string, tenantId: string, lessonId: string): Promise<void> {
    await this.studentLearningRepository.removeLessonBookmark(userId, tenantId, lessonId);
  }

  async listBookmarks(userId: string, tenantId: string, query: PaginationQueryDto): Promise<BookmarksListDto> {
    const result = await this.studentLearningRepository.listBookmarks(userId, tenantId, query);
    const bookmarks = result.bookmarks as BookmarkRecord[];

    return {
      bookmarks: bookmarks.map((bookmark) => this.mapBookmark(bookmark)),
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getDashboard(userId: string, tenantId: string): Promise<StudentDashboardDto> {
    const dashboard = (await this.studentLearningRepository.getDashboard(userId, tenantId)) as DashboardRecord;

    return {
      continueLearning: dashboard.continueLearning.map((progress) => this.mapProgress(progress)),
      recentlyWatched: dashboard.recentlyWatched.map((lesson) => this.mapWatchedLesson(lesson)),
      completedLessons: dashboard.completedLessons,
      completedCourses: dashboard.completedCourses,
      bookmarkedCourses: dashboard.bookmarkedCourses,
      bookmarkedLessons: dashboard.bookmarkedLessons,
      overallStatistics: dashboard.overallStatistics,
    };
  }

  private requireProgress(progress: unknown): LessonProgressDto {
    if (!progress) {
      throw new LessonProgressNotSupportedError();
    }

    return this.mapProgress(progress as LessonProgressRecord);
  }

  private mapProgress(progress: LessonProgressRecord): LessonProgressDto {
    return {
      lessonId: progress.video.lesson.id,
      courseId: progress.video.lesson.courseId,
      videoId: progress.video.id,
      watchedSeconds: progress.watchedSeconds,
      progressPercent: progress.progressPercent,
      completedAt: progress.completedAt?.toISOString() ?? null,
      lastWatchedAt: progress.lastWatchedAt?.toISOString() ?? null,
    };
  }

  private mapWatchedLesson(lesson: WatchedLessonRecord): WatchedLessonDto {
    return {
      lessonId: lesson.video.lesson.id,
      courseId: lesson.video.lesson.courseId,
      videoId: lesson.video.id,
      title: lesson.video.lesson.title,
      courseTitle: lesson.video.lesson.course.title,
      watchedSeconds: lesson.watchedSeconds,
      watchedAt: lesson.watchedAt.toISOString(),
    };
  }

  private mapNote(note: LessonNoteRecord): LessonNoteDto {
    return {
      id: note.id,
      lessonId: note.lessonId,
      courseId: note.lesson.courseId,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  private mapBookmark(bookmark: BookmarkRecord): BookmarkDto {
    return {
      id: bookmark.id,
      courseId: bookmark.courseId,
      lessonId: bookmark.lessonId,
      title: bookmark.lesson?.title ?? bookmark.course.title,
      type: bookmark.lessonId ? "lesson" : "course",
      createdAt: bookmark.createdAt.toISOString(),
    };
  }
}
