export interface CourseResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  status: string;
  language: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
