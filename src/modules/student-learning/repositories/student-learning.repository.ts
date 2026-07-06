import { prisma } from "../../../database/index.js";
import type { PaginationQueryDto, UpdateLessonProgressDto } from "../dto/index.js";
import type { IStudentLearningRepository } from "../interfaces/index.js";

const lessonVideoSelect = {
  id: true,
  courseId: true,
  video: {
    select: {
      id: true,
      durationSeconds: true,
    },
  },
} as const;

const progressSelect = {
  watchedSeconds: true,
  progressPercent: true,
  completedAt: true,
  lastWatchedAt: true,
  video: {
    select: {
      id: true,
      lesson: {
        select: {
          id: true,
          courseId: true,
        },
      },
    },
  },
} as const;

const watchedLessonSelect = {
  watchedSeconds: true,
  watchedAt: true,
  video: {
    select: {
      id: true,
      lesson: {
        select: {
          id: true,
          title: true,
          courseId: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  },
} as const;

const noteSelect = {
  id: true,
  lessonId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  lesson: {
    select: {
      courseId: true,
    },
  },
} as const;

const bookmarkSelect = {
  id: true,
  courseId: true,
  lessonId: true,
  createdAt: true,
  course: {
    select: {
      title: true,
    },
  },
  lesson: {
    select: {
      title: true,
    },
  },
} as const;

export class StudentLearningRepository implements IStudentLearningRepository {
  async findLessonVideo(lessonId: string, tenantId: string) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, tenantId, deletedAt: null },
      select: lessonVideoSelect,
    });

    if (!lesson?.video) {
      return null;
    }

    return {
      lessonId: lesson.id,
      courseId: lesson.courseId,
      videoId: lesson.video.id,
      videoDurationSeconds: lesson.video.durationSeconds,
    };
  }

  async startLesson(userId: string, tenantId: string, lessonId: string) {
    const lessonVideo = await this.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      return null;
    }

    const now = new Date();

    return prisma.$transaction(async (transaction) => {
      const progress = await transaction.watchProgress.upsert({
        where: { tenantId_userId_videoId: { tenantId, userId, videoId: lessonVideo.videoId } },
        update: { lastWatchedAt: now },
        create: { tenantId, userId, videoId: lessonVideo.videoId, watchedSeconds: 0, progressPercent: 0, lastWatchedAt: now },
        select: progressSelect,
      });

      await transaction.watchHistory.create({
        data: { tenantId, userId, videoId: lessonVideo.videoId, watchedSeconds: progress.watchedSeconds, watchedAt: now },
      });

      return progress;
    });
  }

  async updateLessonProgress(userId: string, tenantId: string, lessonId: string, data: UpdateLessonProgressDto) {
    const lessonVideo = await this.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      return null;
    }

    const now = new Date();
    const completedAt = data.progressPercent >= 100 ? now : null;

    return prisma.$transaction(async (transaction) => {
      const progress = await transaction.watchProgress.upsert({
        where: { tenantId_userId_videoId: { tenantId, userId, videoId: lessonVideo.videoId } },
        update: {
          watchedSeconds: data.watchedSeconds,
          progressPercent: data.progressPercent,
          completedAt,
          lastWatchedAt: now,
        },
        create: {
          tenantId,
          userId,
          videoId: lessonVideo.videoId,
          watchedSeconds: data.watchedSeconds,
          progressPercent: data.progressPercent,
          completedAt,
          lastWatchedAt: now,
        },
        select: progressSelect,
      });

      await transaction.watchHistory.create({
        data: { tenantId, userId, videoId: lessonVideo.videoId, watchedSeconds: data.watchedSeconds, watchedAt: now },
      });

      return progress;
    });
  }

  async completeLesson(userId: string, tenantId: string, lessonId: string) {
    const lessonVideo = await this.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      return null;
    }

    const now = new Date();
    const watchedSeconds = lessonVideo.videoDurationSeconds ?? 0;

    return prisma.$transaction(async (transaction) => {
      const progress = await transaction.watchProgress.upsert({
        where: { tenantId_userId_videoId: { tenantId, userId, videoId: lessonVideo.videoId } },
        update: { watchedSeconds, progressPercent: 100, completedAt: now, lastWatchedAt: now },
        create: { tenantId, userId, videoId: lessonVideo.videoId, watchedSeconds, progressPercent: 100, completedAt: now, lastWatchedAt: now },
        select: progressSelect,
      });

      await transaction.watchHistory.create({
        data: { tenantId, userId, videoId: lessonVideo.videoId, watchedSeconds, watchedAt: now },
      });

      return progress;
    });
  }

  async markLessonIncomplete(userId: string, tenantId: string, lessonId: string) {
    const lessonVideo = await this.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      return null;
    }

    return prisma.watchProgress.upsert({
      where: { tenantId_userId_videoId: { tenantId, userId, videoId: lessonVideo.videoId } },
      update: { completedAt: null, progressPercent: 0 },
      create: { tenantId, userId, videoId: lessonVideo.videoId, watchedSeconds: 0, progressPercent: 0 },
      select: progressSelect,
    });
  }

  async getLessonProgress(userId: string, tenantId: string, lessonId: string) {
    const lessonVideo = await this.findLessonVideo(lessonId, tenantId);

    if (!lessonVideo) {
      return null;
    }

    return prisma.watchProgress.findUnique({
      where: { tenantId_userId_videoId: { tenantId, userId, videoId: lessonVideo.videoId } },
      select: progressSelect,
    });
  }

  async getCourseProgress(userId: string, tenantId: string, courseId: string) {
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { tenantId, courseId, deletedAt: null } }),
      prisma.watchProgress.count({
        where: {
          tenantId,
          userId,
          deletedAt: null,
          completedAt: { not: null },
          video: { lesson: { tenantId, courseId, deletedAt: null } },
        },
      }),
    ]);

    return { courseId, totalLessons, completedLessons };
  }

  async getRecentlyWatched(userId: string, tenantId: string, limit: number) {
    return prisma.watchHistory.findMany({
      where: { tenantId, userId, deletedAt: null, video: { lesson: { deletedAt: null } } },
      select: watchedLessonSelect,
      orderBy: { watchedAt: "desc" },
      take: limit,
    });
  }

  async getContinueWatching(userId: string, tenantId: string, limit: number) {
    return prisma.watchProgress.findMany({
      where: { tenantId, userId, deletedAt: null, completedAt: null, progressPercent: { gt: 0 }, video: { lesson: { deletedAt: null } } },
      select: progressSelect,
      orderBy: { lastWatchedAt: "desc" },
      take: limit,
    });
  }

  async getLastWatchedInCourse(userId: string, tenantId: string, courseId: string) {
    return prisma.watchHistory.findFirst({
      where: { tenantId, userId, deletedAt: null, video: { lesson: { courseId, deletedAt: null } } },
      select: watchedLessonSelect,
      orderBy: { watchedAt: "desc" },
    });
  }

  async createNote(userId: string, tenantId: string, lessonId: string, content: string) {
    return prisma.lessonNote.create({
      data: { tenantId, userId, lessonId, content },
      select: noteSelect,
    });
  }

  async updateNote(userId: string, tenantId: string, noteId: string, content: string) {
    const note = await prisma.lessonNote.findFirst({
      where: { id: noteId, tenantId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!note) {
      return null;
    }

    return prisma.lessonNote.update({
      where: { id: note.id },
      data: { content },
      select: noteSelect,
    });
  }

  async deleteNote(userId: string, tenantId: string, noteId: string): Promise<boolean> {
    const result = await prisma.lessonNote.updateMany({
      where: { id: noteId, tenantId, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return result.count > 0;
  }

  async listLessonNotes(userId: string, tenantId: string, lessonId: string, query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      tenantId,
      userId,
      lessonId,
      deletedAt: null,
      ...(query.search ? { content: { contains: query.search, mode: "insensitive" as const } } : {}),
    };

    const [notes, total] = await Promise.all([
      prisma.lessonNote.findMany({ where, select: noteSelect, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
      prisma.lessonNote.count({ where }),
    ]);

    return { notes, total };
  }

  async listMyNotes(userId: string, tenantId: string, query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      tenantId,
      userId,
      deletedAt: null,
      ...(query.search ? { content: { contains: query.search, mode: "insensitive" as const } } : {}),
    };

    const [notes, total] = await Promise.all([
      prisma.lessonNote.findMany({ where, select: noteSelect, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
      prisma.lessonNote.count({ where }),
    ]);

    return { notes, total };
  }

  async bookmarkCourse(userId: string, tenantId: string, courseId: string) {
    const existing = await prisma.bookmark.findFirst({ where: { tenantId, userId, courseId, lessonId: null } });

    if (existing) {
      return prisma.bookmark.update({ where: { id: existing.id }, data: { deletedAt: null }, select: bookmarkSelect });
    }

    return prisma.bookmark.create({ data: { tenantId, userId, courseId }, select: bookmarkSelect });
  }

  async removeCourseBookmark(userId: string, tenantId: string, courseId: string): Promise<void> {
    await prisma.bookmark.updateMany({ where: { tenantId, userId, courseId, lessonId: null, deletedAt: null }, data: { deletedAt: new Date() } });
  }

  async bookmarkLesson(userId: string, tenantId: string, lessonId: string) {
    const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, tenantId, deletedAt: null }, select: { courseId: true } });

    if (!lesson) {
      return null;
    }

    return prisma.bookmark.upsert({
      where: { tenantId_userId_courseId_lessonId: { tenantId, userId, courseId: lesson.courseId, lessonId } },
      update: { deletedAt: null },
      create: { tenantId, userId, courseId: lesson.courseId, lessonId },
      select: bookmarkSelect,
    });
  }

  async removeLessonBookmark(userId: string, tenantId: string, lessonId: string): Promise<void> {
    await prisma.bookmark.updateMany({ where: { tenantId, userId, lessonId, deletedAt: null }, data: { deletedAt: new Date() } });
  }

  async listBookmarks(userId: string, tenantId: string, query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = { tenantId, userId, deletedAt: null };

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({ where, select: bookmarkSelect, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
      prisma.bookmark.count({ where }),
    ]);

    return { bookmarks, total };
  }

  async getDashboard(userId: string, tenantId: string) {
    const [continueLearning, recentlyWatched, completedLessons, bookmarkedCourses, bookmarkedLessons, progressAggregate, completedProgress] = await Promise.all([
      this.getContinueWatching(userId, tenantId, 5),
      this.getRecentlyWatched(userId, tenantId, 5),
      prisma.watchProgress.count({ where: { tenantId, userId, deletedAt: null, completedAt: { not: null } } }),
      prisma.bookmark.count({ where: { tenantId, userId, deletedAt: null, lessonId: null } }),
      prisma.bookmark.count({ where: { tenantId, userId, deletedAt: null, lessonId: { not: null } } }),
      prisma.watchProgress.aggregate({
        where: { tenantId, userId, deletedAt: null },
        _sum: { watchedSeconds: true },
        _avg: { progressPercent: true },
        _count: { id: true },
      }),
      prisma.watchProgress.findMany({
        where: { tenantId, userId, deletedAt: null, completedAt: { not: null }, video: { lesson: { deletedAt: null } } },
        select: { video: { select: { lesson: { select: { courseId: true } } } } },
      }),
    ]);

    const completedCountsByCourse = new Map<string, number>();

    for (const progress of completedProgress) {
      const courseId = progress.video.lesson.courseId;
      completedCountsByCourse.set(courseId, (completedCountsByCourse.get(courseId) ?? 0) + 1);
    }

    const courseIds = [...completedCountsByCourse.keys()];
    const lessonCounts = courseIds.length
      ? await prisma.lesson.groupBy({
          by: ["courseId"],
          where: { tenantId, courseId: { in: courseIds }, deletedAt: null },
          _count: { id: true },
        })
      : [];

    const completedCourses = lessonCounts.filter((course) => {
      const completedCount = completedCountsByCourse.get(course.courseId) ?? 0;
      return course._count.id > 0 && completedCount >= course._count.id;
    }).length;

    return {
      continueLearning,
      recentlyWatched,
      completedLessons,
      completedCourses,
      bookmarkedCourses,
      bookmarkedLessons,
      overallStatistics: {
        watchedLessons: progressAggregate._count.id,
        totalWatchSeconds: progressAggregate._sum.watchedSeconds ?? 0,
        averageProgressPercent: Math.round(progressAggregate._avg.progressPercent ?? 0),
      },
    };
  }
}
