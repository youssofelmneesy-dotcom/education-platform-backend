export type VideoSortBy = "createdAt" | "updatedAt" | "title" | "durationSeconds";
export type SortOrder = "asc" | "desc";

export interface VideoListQueryDto {
  page: number;
  limit: number;
  search?: string;
  lessonId?: string;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  sortBy: VideoSortBy;
  sortOrder: SortOrder;
}
