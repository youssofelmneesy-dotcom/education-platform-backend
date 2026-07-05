import type { CreateTagRequestDto, TagResponseDto, TagsListResponseDto, UpdateTagRequestDto } from "../dto/index.js";

export interface ITagsService {
  create(tenantId: string, data: CreateTagRequestDto): Promise<TagResponseDto>;
  list(tenantId: string, page: number, limit: number): Promise<TagsListResponseDto>;
  getById(id: string, tenantId: string): Promise<TagResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateTagRequestDto): Promise<TagResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
