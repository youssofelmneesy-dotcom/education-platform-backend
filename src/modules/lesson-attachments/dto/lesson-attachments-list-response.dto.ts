import type { LessonAttachmentResponseDto } from "./lesson-attachment-response.dto.js";

export interface LessonAttachmentsListResponseDto {
  attachments: LessonAttachmentResponseDto[];
  total: number;
  page: number;
  limit: number;
}
