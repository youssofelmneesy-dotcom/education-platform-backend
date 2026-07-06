export interface LessonProgressDto {
  lessonId: string;
  courseId: string;
  videoId: string;
  watchedSeconds: number;
  progressPercent: number;
  completedAt: string | null;
  lastWatchedAt: string | null;
}

export interface CourseProgressDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;
  progressPercentage: number;
}

export interface WatchedLessonDto {
  lessonId: string;
  courseId: string;
  videoId: string;
  title: string;
  courseTitle: string;
  watchedSeconds: number;
  watchedAt: string;
}

export interface LessonNoteDto {
  id: string;
  lessonId: string;
  courseId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesListDto {
  notes: LessonNoteDto[];
  total: number;
  page: number;
  limit: number;
}

export interface BookmarkDto {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  type: "course" | "lesson";
  createdAt: string;
}

export interface BookmarksListDto {
  bookmarks: BookmarkDto[];
  total: number;
  page: number;
  limit: number;
}

export interface StudentDashboardDto {
  continueLearning: LessonProgressDto[];
  recentlyWatched: WatchedLessonDto[];
  completedLessons: number;
  completedCourses: number;
  bookmarkedCourses: number;
  bookmarkedLessons: number;
  overallStatistics: {
    watchedLessons: number;
    totalWatchSeconds: number;
    averageProgressPercent: number;
  };
}

export interface UpdateLessonProgressDto {
  watchedSeconds: number;
  progressPercent: number;
}

export interface CreateLessonNoteDto {
  content: string;
}

export interface UpdateLessonNoteDto {
  content: string;
}

export interface PaginationQueryDto {
  page: number;
  limit: number;
  search?: string;
}
