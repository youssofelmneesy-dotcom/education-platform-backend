export interface VideoStatisticsDto {
  totalVideos: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  videosWithThumbnails: number;
  chaptersCount: number;
  subtitlesCount: number;
}
