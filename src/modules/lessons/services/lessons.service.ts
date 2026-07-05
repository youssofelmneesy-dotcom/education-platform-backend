import type { CreateLessonRequestDto, LessonResponseDto, LessonsListResponseDto, UpdateLessonRequestDto } from "../dto/index.js";
import type { ILessonsRepository, ILessonsService } from "../interfaces/index.js";
import type { LessonRecord } from "../types/index.js";
import { LessonsRepository } from "../repositories/index.js";
import { DuplicateLessonSlugError, LessonNotFoundError, CourseNotFoundError } from "../utils/index.js";
import { prisma } from "../../../database/index.js";

export class LessonsService implements ILessonsService {
  constructor(private readonly lessonsRepository: ILessonsRepository = new LessonsRepository()) {}

  async create(tenantId: string, data: CreateLessonRequestDto): Promise<LessonResponseDto> {
    // Verify course exists
    const course = await prisma.course.findFirst({
      where: {
        id: data.courseId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    const existing = await this.lessonsRepository.findBySlug(data.slug, data.courseId, tenantId);

    if (existing) {
      throw new DuplicateLessonSlugError();
    }

    const lesson = await this.lessonsRepository.create(tenantId, data);

    return this.mapLessonToResponse(lesson);
  }

  async listByCourse(tenantId: string, courseId: string, page: number, limit: number, search?: string): Promise<LessonsListResponseDto> {
    // Verify course exists
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    const { lessons, total } = await this.lessonsRepository.listByCourse(tenantId, courseId, page, limit, search);

    return {
      lessons: lessons.map((lesson) => this.mapLessonToResponse(lesson)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonsRepository.findById(id, tenantId);

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    return this.mapLessonToResponse(lesson);
  }

  async updateById(id: string, tenantId: string, data: UpdateLessonRequestDto): Promise<LessonResponseDto> {
    const lesson = await this.lessonsRepository.findById(id, tenantId);

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    if (data.slug && data.slug !== lesson.slug) {
      const existing = await this.lessonsRepository.findBySlug(data.slug, lesson.courseId, tenantId);

      if (existing && existing.id !== id) {
        throw new DuplicateLessonSlugError();
      }
    }

    const updated = await this.lessonsRepository.updateById(id, tenantId, data);

    if (!updated) {
      throw new LessonNotFoundError();
    }

    return this.mapLessonToResponse(updated);
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const lesson = await this.lessonsRepository.findById(id, tenantId);

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    await this.lessonsRepository.softDeleteById(id, tenantId);
  }

  private mapLessonToResponse(lesson: LessonRecord): LessonResponseDto {
    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      content: lesson.content,
      sortOrder: lesson.sortOrder,
      durationSeconds: lesson.durationSeconds,
      isPreview: lesson.isPreview,
      publishedAt: lesson.publishedAt?.toISOString() ?? null,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString(),
    };
  }
}
