import type { CourseResponseDto } from "./course-response.dto.js";

export interface CoursesListResponseDto {
  courses: CourseResponseDto[];
  total: number;
  page: number;
  limit: number;
}
