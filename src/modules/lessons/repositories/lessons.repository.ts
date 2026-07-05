import { prisma } from "../../../database/index.js";
import type { CreateLessonRequestDto, UpdateLessonRequestDto } from "../dto/index.js";
import type { ILessonsRepository } from "../interfaces/index.js";
import type { LessonRecord } from "../types/index.js";

export class LessonsRepository implements ILessonsRepository {
  async create(tenantId: string, data: CreateLessonRequestDto): Promise<LessonRecord> {
    return prisma.lesson.create({
      data: {
        tenantId,
        courseId: data.courseId,
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        content: data.content ?? null,
        sortOrder: data.sortOrder ?? 0,
        durationSeconds: data.durationSeconds ?? null,
        isPreview: data.isPreview ?? false,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        sortOrder: true,
        durationSeconds: true,
        isPreview: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<LessonRecord | null> {
    return prisma.lesson.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        sortOrder: true,
        durationSeconds: true,
        isPreview: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string, courseId: string, tenantId: string): Promise<LessonRecord | null> {
    return prisma.lesson.findFirst({
      where: {
        tenantId,
        courseId,
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        sortOrder: true,
        durationSeconds: true,
        isPreview: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listByCourse(tenantId: string, courseId: string, page: number, limit: number, search?: string): Promise<{ lessons: LessonRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause = {
      tenantId,
      courseId,
      deletedAt: null,
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }],
      }),
    };

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where: whereClause,
        select: {
          id: true,
          courseId: true,
          title: true,
          slug: true,
          description: true,
          content: true,
          sortOrder: true,
          durationSeconds: true,
          isPreview: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.lesson.count({
        where: whereClause,
      }),
    ]);

    return { lessons, total };
  }

  async updateById(id: string, tenantId: string, data: UpdateLessonRequestDto): Promise<LessonRecord | null> {
    return prisma.lesson.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        sortOrder: data.sortOrder,
        durationSeconds: data.durationSeconds,
        isPreview: data.isPreview,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        sortOrder: true,
        durationSeconds: true,
        isPreview: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.lesson.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
