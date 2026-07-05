import type { TagResponseDto } from "./tag-response.dto.js";

export interface TagsListResponseDto {
  tags: TagResponseDto[];
  total: number;
  page: number;
  limit: number;
}
