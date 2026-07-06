export interface LessonVideoRecord {
  lessonId: string;
  courseId: string;
  videoId: string;
  videoDurationSeconds: number | null;
}

export interface LessonProgressRecord {
  watchedSeconds: number;
  progressPercent: number;
  completedAt: Date | null;
  lastWatchedAt: Date | null;
  video: {
    id: string;
    lesson: {
      id: string;
      courseId: string;
    };
  };
}

export interface WatchedLessonRecord {
  watchedSeconds: number;
  watchedAt: Date;
  video: {
    id: string;
    lesson: {
      id: string;
      title: string;
      courseId: string;
      course: {
        title: string;
      };
    };
  };
}

export interface LessonNoteRecord {
  id: string;
  lessonId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  lesson: {
    courseId: string;
  };
}

export interface BookmarkRecord {
  id: string;
  courseId: string;
  lessonId: string | null;
  createdAt: Date;
  course: {
    title: string;
  };
  lesson: {
    title: string;
  } | null;
}

export interface CourseProgressRecord {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
}

export interface DashboardRecord {
  continueLearning: LessonProgressRecord[];
  recentlyWatched: WatchedLessonRecord[];
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
