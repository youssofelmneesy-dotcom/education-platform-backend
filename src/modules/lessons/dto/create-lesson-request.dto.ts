export interface CreateLessonRequestDto {
  courseId: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  sortOrder?: number;
  durationSeconds?: number | null;
  isPreview?: boolean;
}
