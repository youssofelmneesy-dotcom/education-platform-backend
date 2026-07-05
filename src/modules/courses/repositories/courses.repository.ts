import { prisma } from "../../../database/index.js";
import type { CreateCourseRequestDto, UpdateCourseRequestDto } from "../dto/index.js";
import type { ICoursesRepository } from "../interfaces/index.js";
import type { CourseRecord } from "../types/index.js";

export class CoursesRepository implements ICoursesRepository {
  async create(tenantId: string, data: CreateCourseRequestDto): Promise<CourseRecord> {
    return prisma.course.create({
      data: {
        tenantId,
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        shortDescription: data.shortDescription ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        status: data.status ?? "draft",
        language: data.language ?? null,
        durationSeconds: data.durationSeconds ?? null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        thumbnailUrl: true,
        status: true,
        language: true,
        durationSeconds: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<CourseRecord | null> {
    return prisma.course.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        thumbnailUrl: true,
        status: true,
        language: true,
        durationSeconds: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string, tenantId: string): Promise<CourseRecord | null> {
    return prisma.course.findFirst({
      where: {
        tenantId,
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        thumbnailUrl: true,
        status: true,
        language: true,
        durationSeconds: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async list(tenantId: string, page: number, limit: number, search?: string): Promise<{ courses: CourseRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          shortDescription: true,
          thumbnailUrl: true,
          status: true,
          language: true,
          durationSeconds: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.course.count({
        where: whereClause,
      }),
    ]);

    return { courses, total };
  }

  async updateById(id: string, tenantId: string, data: UpdateCourseRequestDto): Promise<CourseRecord | null> {
    return prisma.course.update({
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
        shortDescription: data.shortDescription,
        thumbnailUrl: data.thumbnailUrl,
        status: data.status,
        language: data.language,
        durationSeconds: data.durationSeconds,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        thumbnailUrl: true,
        status: true,
        language: true,
        durationSeconds: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.course.update({
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
