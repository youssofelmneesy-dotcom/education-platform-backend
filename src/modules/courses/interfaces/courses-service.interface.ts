import type { CreateCourseRequestDto, CourseResponseDto, CoursesListResponseDto, UpdateCourseRequestDto } from "../dto/index.js";

export interface ICoursesService {
  create(tenantId: string, data: CreateCourseRequestDto): Promise<CourseResponseDto>;
  list(tenantId: string, page: number, limit: number, search?: string): Promise<CoursesListResponseDto>;
  getById(id: string, tenantId: string): Promise<CourseResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateCourseRequestDto): Promise<CourseResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
