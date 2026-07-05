export interface LessonRecord {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  sortOrder: number;
  durationSeconds: number | null;
  isPreview: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
