import type {
  CreateVideoChapterDto,
  CreateVideoRequestDto,
  CreateVideoSubtitleDto,
  UpdateVideoChapterDto,
  UpdateVideoRequestDto,
  UpdateVideoSubtitleDto,
  VideoListQueryDto,
} from "../dto/index.js";
import type { VideoChapterRecord, VideoRecord, VideoSubtitleRecord } from "../types/index.js";

export interface IVideosRepository {
  create(tenantId: string, data: CreateVideoRequestDto): Promise<VideoRecord>;
  list(tenantId: string, query: VideoListQueryDto): Promise<{ videos: VideoRecord[]; total: number }>;
  findById(id: string, tenantId: string): Promise<VideoRecord | null>;
  findByLessonId(lessonId: string, tenantId: string): Promise<VideoRecord | null>;
  lessonExists(lessonId: string, tenantId: string): Promise<boolean>;
  updateById(id: string, tenantId: string, data: UpdateVideoRequestDto): Promise<VideoRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
  getPreviousVideo(id: string, tenantId: string): Promise<VideoRecord | null>;
  getNextVideo(id: string, tenantId: string): Promise<VideoRecord | null>;
  listLessonVideos(lessonId: string, tenantId: string): Promise<VideoRecord[]>;
  createChapter(videoId: string, tenantId: string, data: CreateVideoChapterDto): Promise<VideoChapterRecord>;
  listChapters(videoId: string, tenantId: string): Promise<VideoChapterRecord[]>;
  findChapterById(videoId: string, chapterId: string, tenantId: string): Promise<VideoChapterRecord | null>;
  updateChapter(videoId: string, chapterId: string, tenantId: string, data: UpdateVideoChapterDto): Promise<VideoChapterRecord | null>;
  deleteChapter(videoId: string, chapterId: string, tenantId: string): Promise<boolean>;
  createSubtitle(videoId: string, tenantId: string, data: CreateVideoSubtitleDto): Promise<VideoSubtitleRecord>;
  listSubtitles(videoId: string, tenantId: string): Promise<VideoSubtitleRecord[]>;
  findSubtitleById(videoId: string, subtitleId: string, tenantId: string): Promise<VideoSubtitleRecord | null>;
  updateSubtitle(videoId: string, subtitleId: string, tenantId: string, data: UpdateVideoSubtitleDto): Promise<VideoSubtitleRecord | null>;
  deleteSubtitle(videoId: string, subtitleId: string, tenantId: string): Promise<boolean>;
  getStatistics(tenantId: string): Promise<{
    totalVideos: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
    videosWithThumbnails: number;
    chaptersCount: number;
    subtitlesCount: number;
  }>;
}
