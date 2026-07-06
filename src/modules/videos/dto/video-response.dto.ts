export interface VideoResponseDto {
  id: string;
  lessonId: string;
  title: string | null;
  sourceUrl: string;
  playbackUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}
