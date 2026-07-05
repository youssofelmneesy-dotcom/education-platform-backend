import type { CreateLessonRequestDto, UpdateLessonRequestDto } from "../dto/index.js";
import type { LessonRecord } from "../types/index.js";

export interface ILessonsRepository {
  create(tenantId: string, data: CreateLessonRequestDto): Promise<LessonRecord>;
  findById(id: string, tenantId: string): Promise<LessonRecord | null>;
  findBySlug(slug: string, courseId: string, tenantId: string): Promise<LessonRecord | null>;
  listByCourse(tenantId: string, courseId: string, page: number, limit: number, search?: string): Promise<{ lessons: LessonRecord[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdateLessonRequestDto): Promise<LessonRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
