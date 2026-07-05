import type { LessonResponseDto } from "./lesson-response.dto.js";

export interface LessonsListResponseDto {
  lessons: LessonResponseDto[];
  total: number;
  page: number;
  limit: number;
}
