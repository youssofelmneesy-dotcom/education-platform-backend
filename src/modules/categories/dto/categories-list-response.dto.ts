import type { CategoryResponseDto } from "./category-response.dto.js";

export interface CategoriesListResponseDto {
  categories: CategoryResponseDto[];
  total: number;
  page: number;
  limit: number;
}
