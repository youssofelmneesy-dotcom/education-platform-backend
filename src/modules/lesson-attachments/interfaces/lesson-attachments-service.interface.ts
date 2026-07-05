import type { CreateLessonAttachmentRequestDto, LessonAttachmentResponseDto, LessonAttachmentsListResponseDto, UpdateLessonAttachmentRequestDto } from "../dto/index.js";

export interface ILessonAttachmentsService {
  create(tenantId: string, data: CreateLessonAttachmentRequestDto): Promise<LessonAttachmentResponseDto>;
  listByLesson(tenantId: string, lessonId: string, page: number, limit: number, search?: string): Promise<LessonAttachmentsListResponseDto>;
  getById(id: string, tenantId: string): Promise<LessonAttachmentResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateLessonAttachmentRequestDto): Promise<LessonAttachmentResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
