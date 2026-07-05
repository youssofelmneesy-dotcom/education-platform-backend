export interface CreateLessonAttachmentRequestDto {
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  sortOrder?: number;
}
