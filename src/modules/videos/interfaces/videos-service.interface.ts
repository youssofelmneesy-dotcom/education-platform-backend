import type {
  CreateVideoChapterDto,
  CreateVideoRequestDto,
  CreateVideoSubtitleDto,
  UpdateVideoChapterDto,
  UpdateVideoRequestDto,
  UpdateVideoSubtitleDto,
  VideoChapterDto,
  VideoListQueryDto,
  VideoResponseDto,
  VideoStatisticsDto,
  VideoSubtitleDto,
  VideosListResponseDto,
} from "../dto/index.js";

export interface IVideosService {
  create(tenantId: string, data: CreateVideoRequestDto): Promise<VideoResponseDto>;
  list(tenantId: string, query: VideoListQueryDto): Promise<VideosListResponseDto>;
  getById(id: string, tenantId: string): Promise<VideoResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateVideoRequestDto): Promise<VideoResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
  getPreviousVideo(id: string, tenantId: string): Promise<VideoResponseDto | null>;
  getNextVideo(id: string, tenantId: string): Promise<VideoResponseDto | null>;
  listLessonVideos(lessonId: string, tenantId: string): Promise<VideoResponseDto[]>;
  createChapter(videoId: string, tenantId: string, data: CreateVideoChapterDto): Promise<VideoChapterDto>;
  listChapters(videoId: string, tenantId: string): Promise<VideoChapterDto[]>;
  getChapterById(videoId: string, chapterId: string, tenantId: string): Promise<VideoChapterDto>;
  updateChapter(videoId: string, chapterId: string, tenantId: string, data: UpdateVideoChapterDto): Promise<VideoChapterDto>;
  deleteChapter(videoId: string, chapterId: string, tenantId: string): Promise<void>;
  createSubtitle(videoId: string, tenantId: string, data: CreateVideoSubtitleDto): Promise<VideoSubtitleDto>;
  listSubtitles(videoId: string, tenantId: string): Promise<VideoSubtitleDto[]>;
  getSubtitleById(videoId: string, subtitleId: string, tenantId: string): Promise<VideoSubtitleDto>;
  updateSubtitle(videoId: string, subtitleId: string, tenantId: string, data: UpdateVideoSubtitleDto): Promise<VideoSubtitleDto>;
  deleteSubtitle(videoId: string, subtitleId: string, tenantId: string): Promise<void>;
  getStatistics(tenantId: string): Promise<VideoStatisticsDto>;
}
