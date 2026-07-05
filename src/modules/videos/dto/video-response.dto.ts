export interface VideoResponseDto {
  id: string;
  lessonId: string;
  title: string | null;
  sourceUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}
