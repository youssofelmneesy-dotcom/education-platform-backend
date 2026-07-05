export interface LessonAttachmentResponseDto {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
