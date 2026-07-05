import type { CreateLessonAttachmentRequestDto, UpdateLessonAttachmentRequestDto } from "../dto/index.js";

export interface ILessonAttachmentsRepository {
  create(tenantId: string, data: CreateLessonAttachmentRequestDto): Promise<any>;
  findById(id: string, tenantId: string): Promise<any | null>;
  findByLessonId(lessonId: string, tenantId: string): Promise<any | null>;
  listByLesson(tenantId: string, lessonId: string, page: number, limit: number, search?: string): Promise<{ attachments: any[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdateLessonAttachmentRequestDto): Promise<any | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
