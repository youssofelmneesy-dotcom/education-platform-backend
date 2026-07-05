import type { CreateVideoRequestDto, UpdateVideoRequestDto } from "../dto/index.js";

export interface IVideosRepository {
  create(tenantId: string, data: CreateVideoRequestDto): Promise<any>;
  findById(id: string, tenantId: string): Promise<any | null>;
  findByLessonId(lessonId: string, tenantId: string): Promise<any | null>;
  updateById(id: string, tenantId: string, data: UpdateVideoRequestDto): Promise<any | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
