import type { CreateVideoRequestDto, UpdateVideoRequestDto } from "../dto/index.js";
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
}
