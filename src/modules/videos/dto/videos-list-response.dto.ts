import type { VideoResponseDto } from "./video-response.dto.js";

export interface VideosListResponseDto {
  videos: VideoResponseDto[];
  total: number;
  page: number;
  limit: number;
}
