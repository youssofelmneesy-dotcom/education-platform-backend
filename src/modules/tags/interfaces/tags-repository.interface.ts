import type { CreateTagRequestDto, UpdateTagRequestDto } from "../dto/index.js";
import type { TagRecord } from "../types/index.js";

export interface ITagsRepository {
  create(tenantId: string, data: CreateTagRequestDto): Promise<TagRecord>;
  findById(id: string, tenantId: string): Promise<TagRecord | null>;
  findBySlug(slug: string, tenantId: string): Promise<TagRecord | null>;
  list(tenantId: string, page: number, limit: number): Promise<{ tags: TagRecord[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdateTagRequestDto): Promise<TagRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
