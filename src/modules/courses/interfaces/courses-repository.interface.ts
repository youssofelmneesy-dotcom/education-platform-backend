import type { CreateCourseRequestDto, UpdateCourseRequestDto } from "../dto/index.js";
import type { CourseRecord } from "../types/index.js";

export interface ICoursesRepository {
  create(tenantId: string, data: CreateCourseRequestDto): Promise<CourseRecord>;
  findById(id: string, tenantId: string): Promise<CourseRecord | null>;
  findBySlug(slug: string, tenantId: string): Promise<CourseRecord | null>;
  list(tenantId: string, page: number, limit: number, search?: string): Promise<{ courses: CourseRecord[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdateCourseRequestDto): Promise<CourseRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
