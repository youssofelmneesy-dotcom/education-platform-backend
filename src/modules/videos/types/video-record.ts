export interface VideoRecord {
  id: string;
  tenantId: string;
  lessonId: string;
  title: string | null;
  sourceUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
