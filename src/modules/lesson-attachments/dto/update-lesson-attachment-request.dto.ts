export interface UpdateLessonAttachmentRequestDto {
  title?: string;
  fileUrl?: string;
  fileType?: string | null;
  fileSize?: number | null;
  sortOrder?: number;
}
