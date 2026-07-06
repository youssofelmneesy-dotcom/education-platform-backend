import type {
  CreateVideoChapterDto,
  CreateVideoRequestDto,
  CreateVideoSubtitleDto,
  UpdateVideoChapterDto,
  UpdateVideoRequestDto,
  UpdateVideoSubtitleDto,
  VideoListQueryDto,
} from "../dto/index.js";
import type { IVideosRepository } from "../interfaces/index.js";
import { prisma } from "../../../database/index.js";

export class VideosRepository implements IVideosRepository {
  async create(tenantId: string, data: CreateVideoRequestDto) {
    return prisma.video.create({
      data: {
        title: data.title,
        sourceUrl: data.sourceUrl,
        thumbnailUrl: data.thumbnailUrl,
        durationSeconds: data.durationSeconds,
        tenantId,
        lessonId: data.lessonId,
      },
    });
  }

  async list(tenantId: string, query: VideoListQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      tenantId,
      deletedAt: null,
      ...(query.lessonId ? { lessonId: query.lessonId } : {}),
      ...(query.search
        ? {
            OR: [{ title: { contains: query.search, mode: "insensitive" as const } }, { sourceUrl: { contains: query.search, mode: "insensitive" as const } }],
          }
        : {}),
      ...(query.minDurationSeconds !== undefined || query.maxDurationSeconds !== undefined
        ? {
            durationSeconds: {
              ...(query.minDurationSeconds !== undefined ? { gte: query.minDurationSeconds } : {}),
              ...(query.maxDurationSeconds !== undefined ? { lte: query.maxDurationSeconds } : {}),
            },
          }
        : {}),
    };

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take: query.limit,
      }),
      prisma.video.count({ where }),
    ]);

    return { videos, total };
  }

  async findById(id: string, tenantId: string) {
    return prisma.video.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async findByLessonId(lessonId: string, tenantId: string) {
    return prisma.video.findFirst({
      where: {
        lessonId,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async lessonExists(lessonId: string, tenantId: string): Promise<boolean> {
    const count = await prisma.lesson.count({
      where: {
        id: lessonId,
        tenantId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async updateById(id: string, tenantId: string, data: UpdateVideoRequestDto) {
    return prisma.video.update({
      where: {
        tenantId_id: { id, tenantId },
      },
      data,
    });
  }

  async softDeleteById(id: string, tenantId: string) {
    await prisma.video.update({
      where: {
        tenantId_id: { id, tenantId },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getPreviousVideo(id: string, tenantId: string) {
    const current = await prisma.video.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: { lesson: { select: { courseId: true, sortOrder: true, createdAt: true } } },
    });

    if (!current) {
      return null;
    }

    return prisma.video.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        lesson: {
          courseId: current.lesson.courseId,
          deletedAt: null,
          OR: [{ sortOrder: { lt: current.lesson.sortOrder } }, { sortOrder: current.lesson.sortOrder, createdAt: { lt: current.lesson.createdAt } }],
        },
      },
      orderBy: [{ lesson: { sortOrder: "desc" } }, { lesson: { createdAt: "desc" } }],
    });
  }

  async getNextVideo(id: string, tenantId: string) {
    const current = await prisma.video.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: { lesson: { select: { courseId: true, sortOrder: true, createdAt: true } } },
    });

    if (!current) {
      return null;
    }

    return prisma.video.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        lesson: {
          courseId: current.lesson.courseId,
          deletedAt: null,
          OR: [{ sortOrder: { gt: current.lesson.sortOrder } }, { sortOrder: current.lesson.sortOrder, createdAt: { gt: current.lesson.createdAt } }],
        },
      },
      orderBy: [{ lesson: { sortOrder: "asc" } }, { lesson: { createdAt: "asc" } }],
    });
  }

  async listLessonVideos(lessonId: string, tenantId: string) {
    return prisma.video.findMany({
      where: { tenantId, lessonId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  }

  async createChapter(videoId: string, tenantId: string, data: CreateVideoChapterDto) {
    return prisma.videoChapter.create({
      data: {
        tenantId,
        videoId,
        title: data.title,
        startSecond: data.startSecond,
        sortOrder: data.sortOrder,
      },
    });
  }

  async listChapters(videoId: string, tenantId: string) {
    return prisma.videoChapter.findMany({
      where: { tenantId, videoId, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { startSecond: "asc" }],
    });
  }

  async findChapterById(videoId: string, chapterId: string, tenantId: string) {
    return prisma.videoChapter.findFirst({
      where: { id: chapterId, videoId, tenantId, deletedAt: null },
    });
  }

  async updateChapter(videoId: string, chapterId: string, tenantId: string, data: UpdateVideoChapterDto) {
    const chapter = await this.findChapterById(videoId, chapterId, tenantId);

    if (!chapter) {
      return null;
    }

    return prisma.videoChapter.update({
      where: { id: chapter.id },
      data,
    });
  }

  async deleteChapter(videoId: string, chapterId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.videoChapter.updateMany({
      where: { id: chapterId, videoId, tenantId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return result.count > 0;
  }

  async createSubtitle(videoId: string, tenantId: string, data: CreateVideoSubtitleDto) {
    return prisma.$transaction(async (transaction) => {
      if (data.isDefault) {
        await transaction.subtitle.updateMany({
          where: { tenantId, videoId, deletedAt: null },
          data: { isDefault: false },
        });
      }

      return transaction.subtitle.create({
        data: {
          tenantId,
          videoId,
          language: data.language,
          label: data.label,
          fileUrl: data.fileUrl,
          isDefault: data.isDefault,
        },
      });
    });
  }

  async listSubtitles(videoId: string, tenantId: string) {
    return prisma.subtitle.findMany({
      where: { tenantId, videoId, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { language: "asc" }],
    });
  }

  async findSubtitleById(videoId: string, subtitleId: string, tenantId: string) {
    return prisma.subtitle.findFirst({
      where: { id: subtitleId, videoId, tenantId, deletedAt: null },
    });
  }

  async updateSubtitle(videoId: string, subtitleId: string, tenantId: string, data: UpdateVideoSubtitleDto) {
    const subtitle = await this.findSubtitleById(videoId, subtitleId, tenantId);

    if (!subtitle) {
      return null;
    }

    return prisma.$transaction(async (transaction) => {
      if (data.isDefault) {
        await transaction.subtitle.updateMany({
          where: { tenantId, videoId, deletedAt: null, id: { not: subtitle.id } },
          data: { isDefault: false },
        });
      }

      return transaction.subtitle.update({
        where: { id: subtitle.id },
        data,
      });
    });
  }

  async deleteSubtitle(videoId: string, subtitleId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.subtitle.updateMany({
      where: { id: subtitleId, videoId, tenantId, deletedAt: null },
      data: { deletedAt: new Date(), isDefault: false },
    });

    return result.count > 0;
  }

  async getStatistics(tenantId: string) {
    const [videoAggregate, videosWithThumbnails, chaptersCount, subtitlesCount] = await Promise.all([
      prisma.video.aggregate({
        where: { tenantId, deletedAt: null },
        _count: { id: true },
        _sum: { durationSeconds: true },
        _avg: { durationSeconds: true },
      }),
      prisma.video.count({
        where: { tenantId, deletedAt: null, thumbnailUrl: { not: null } },
      }),
      prisma.videoChapter.count({ where: { tenantId, deletedAt: null } }),
      prisma.subtitle.count({ where: { tenantId, deletedAt: null } }),
    ]);

    return {
      totalVideos: videoAggregate._count.id,
      totalDurationSeconds: videoAggregate._sum.durationSeconds ?? 0,
      averageDurationSeconds: Math.round(videoAggregate._avg.durationSeconds ?? 0),
      videosWithThumbnails,
      chaptersCount,
      subtitlesCount,
    };
  }
}
