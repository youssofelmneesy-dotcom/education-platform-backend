export interface UpdateVideoRequestDto {
  title?: string | null;
  sourceUrl?: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
}
