export interface CourseListQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  categoryId?: string;
  tagId?: string;
  instructorId?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "publishedAt" | "durationSeconds";
  sortOrder?: "asc" | "desc";
}
