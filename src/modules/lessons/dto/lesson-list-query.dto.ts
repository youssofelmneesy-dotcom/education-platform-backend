export interface LessonListQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: "draft" | "published";
  isPreview?: boolean;
  sortBy?: "sortOrder" | "createdAt" | "updatedAt" | "title" | "publishedAt" | "durationSeconds";
  sortOrder?: "asc" | "desc";
}
