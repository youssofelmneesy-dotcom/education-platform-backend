import type { CreateCategoryRequestDto, CategoryResponseDto, CategoriesListResponseDto, UpdateCategoryRequestDto } from "../dto/index.js";

export interface ICategoriesService {
  create(tenantId: string, data: CreateCategoryRequestDto): Promise<CategoryResponseDto>;
  list(tenantId: string, page: number, limit: number): Promise<CategoriesListResponseDto>;
  getById(id: string, tenantId: string): Promise<CategoryResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateCategoryRequestDto): Promise<CategoryResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
