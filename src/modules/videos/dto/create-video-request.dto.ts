export interface CreateVideoRequestDto {
  lessonId: string;
  title?: string | null;
  sourceUrl: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
}
