export interface UpdateCourseRequestDto {
  title?: string;
  slug?: string;
  description?: string | null;
  shortDescription?: string | null;
  thumbnailUrl?: string | null;
  status?: string;
  language?: string | null;
  durationSeconds?: number | null;
}
