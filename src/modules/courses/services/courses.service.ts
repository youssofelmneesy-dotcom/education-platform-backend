import type { CreateCourseRequestDto, CourseResponseDto, CoursesListResponseDto, UpdateCourseRequestDto } from "../dto/index.js";
import type { ICoursesRepository, ICoursesService } from "../interfaces/index.js";
import { CoursesRepository } from "../repositories/index.js";
import { DuplicateCourseSlugError, CourseNotFoundError } from "../utils/index.js";

export class CoursesService implements ICoursesService {
  constructor(private readonly coursesRepository: ICoursesRepository = new CoursesRepository()) {}

  async create(tenantId: string, data: CreateCourseRequestDto): Promise<CourseResponseDto> {
    const existing = await this.coursesRepository.findBySlug(data.slug, tenantId);

    if (existing) {
      throw new DuplicateCourseSlugError();
    }

    const course = await this.coursesRepository.create(tenantId, data);

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      language: course.language,
      durationSeconds: course.durationSeconds,
      publishedAt: course.publishedAt?.toISOString() ?? null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, page: number, limit: number, search?: string): Promise<CoursesListResponseDto> {
    const { courses, total } = await this.coursesRepository.list(tenantId, page, limit, search);

    return {
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        thumbnailUrl: course.thumbnailUrl,
        status: course.status,
        language: course.language,
        durationSeconds: course.durationSeconds,
        publishedAt: course.publishedAt?.toISOString() ?? null,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<CourseResponseDto> {
    const course = await this.coursesRepository.findById(id, tenantId);

    if (!course) {
      throw new CourseNotFoundError();
    }

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      language: course.language,
      durationSeconds: course.durationSeconds,
      publishedAt: course.publishedAt?.toISOString() ?? null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  async updateById(id: string, tenantId: string, data: UpdateCourseRequestDto): Promise<CourseResponseDto> {
    if (data.slug) {
      const existing = await this.coursesRepository.findBySlug(data.slug, tenantId);

      if (existing && existing.id !== id) {
        throw new DuplicateCourseSlugError();
      }
    }

    const course = await this.coursesRepository.updateById(id, tenantId, data);

    if (!course) {
      throw new CourseNotFoundError();
    }

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      language: course.language,
      durationSeconds: course.durationSeconds,
      publishedAt: course.publishedAt?.toISOString() ?? null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const course = await this.coursesRepository.findById(id, tenantId);

    if (!course) {
      throw new CourseNotFoundError();
    }

    await this.coursesRepository.softDeleteById(id, tenantId);
  }
}
