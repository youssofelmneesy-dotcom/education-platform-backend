export interface LessonResponseDto {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  sortOrder: number;
  durationSeconds: number | null;
  isPreview: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
