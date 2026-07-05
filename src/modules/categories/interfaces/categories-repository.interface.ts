import type { CreateCategoryRequestDto, UpdateCategoryRequestDto } from "../dto/index.js";
import type { CategoryRecord } from "../types/index.js";

export interface ICategoriesRepository {
  create(tenantId: string, data: CreateCategoryRequestDto): Promise<CategoryRecord>;
  findById(id: string, tenantId: string): Promise<CategoryRecord | null>;
  findBySlug(slug: string, tenantId: string): Promise<CategoryRecord | null>;
  list(tenantId: string, page: number, limit: number): Promise<{ categories: CategoryRecord[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdateCategoryRequestDto): Promise<CategoryRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
