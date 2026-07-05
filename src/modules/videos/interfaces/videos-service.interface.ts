import type { CreateVideoRequestDto, UpdateVideoRequestDto, VideoResponseDto } from "../dto/index.js";

export interface IVideosService {
  create(tenantId: string, data: CreateVideoRequestDto): Promise<VideoResponseDto>;
  getById(id: string, tenantId: string): Promise<VideoResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateVideoRequestDto): Promise<VideoResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
