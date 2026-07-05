export interface LessonAttachmentRecord {
  id: string;
  tenantId: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
