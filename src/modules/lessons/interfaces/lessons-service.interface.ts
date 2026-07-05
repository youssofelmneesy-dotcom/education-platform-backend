import type { CreateLessonRequestDto, LessonResponseDto, LessonsListResponseDto, UpdateLessonRequestDto } from "../dto/index.js";

export interface ILessonsService {
  create(tenantId: string, data: CreateLessonRequestDto): Promise<LessonResponseDto>;
  listByCourse(tenantId: string, courseId: string, page: number, limit: number, search?: string): Promise<LessonsListResponseDto>;
  getById(id: string, tenantId: string): Promise<LessonResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateLessonRequestDto): Promise<LessonResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
