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
import type { IVideosRepository, IVideosService } from "../interfaces/index.js";
import type { VideoChapterRecord, VideoRecord, VideoSubtitleRecord } from "../types/index.js";
import { VideosRepository } from "../repositories/index.js";
import { LessonNotFoundError, VideoAlreadyExistsForLessonError, VideoChapterNotFoundError, VideoNotFoundError, VideoSubtitleNotFoundError } from "../utils/index.js";

export class VideosService implements IVideosService {
  constructor(private readonly videosRepository: IVideosRepository = new VideosRepository()) {}

  async create(tenantId: string, data: CreateVideoRequestDto): Promise<VideoResponseDto> {
    const lessonExists = await this.videosRepository.lessonExists(data.lessonId, tenantId);

    if (!lessonExists) {
      throw new LessonNotFoundError();
    }

    const existing = await this.videosRepository.findByLessonId(data.lessonId, tenantId);

    if (existing) {
      throw new VideoAlreadyExistsForLessonError();
    }

    const video = await this.videosRepository.create(tenantId, data);

    return this.mapVideoToResponse(video);
  }

  async list(tenantId: string, query: VideoListQueryDto): Promise<VideosListResponseDto> {
    const { videos, total } = await this.videosRepository.list(tenantId, query);

    return {
      videos: videos.map((video) => this.mapVideoToResponse(video)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<VideoResponseDto> {
    const video = await this.videosRepository.findById(id, tenantId);

    if (!video) {
      throw new VideoNotFoundError();
    }

    return this.mapVideoToResponse(video);
  }

  async updateById(id: string, tenantId: string, data: UpdateVideoRequestDto): Promise<VideoResponseDto> {
    const video = await this.videosRepository.findById(id, tenantId);

    if (!video) {
      throw new VideoNotFoundError();
    }

    const updated = await this.videosRepository.updateById(id, tenantId, data);

    if (!updated) {
      throw new VideoNotFoundError();
    }

    return this.mapVideoToResponse(updated);
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const video = await this.videosRepository.findById(id, tenantId);

    if (!video) {
      throw new VideoNotFoundError();
    }

    await this.videosRepository.softDeleteById(id, tenantId);
  }

  async getPreviousVideo(id: string, tenantId: string): Promise<VideoResponseDto | null> {
    const current = await this.videosRepository.findById(id, tenantId);

    if (!current) {
      throw new VideoNotFoundError();
    }

    const video = await this.videosRepository.getPreviousVideo(id, tenantId);
    return video ? this.mapVideoToResponse(video) : null;
  }

  async getNextVideo(id: string, tenantId: string): Promise<VideoResponseDto | null> {
    const current = await this.videosRepository.findById(id, tenantId);

    if (!current) {
      throw new VideoNotFoundError();
    }

    const video = await this.videosRepository.getNextVideo(id, tenantId);
    return video ? this.mapVideoToResponse(video) : null;
  }

  async listLessonVideos(lessonId: string, tenantId: string): Promise<VideoResponseDto[]> {
    const lessonExists = await this.videosRepository.lessonExists(lessonId, tenantId);

    if (!lessonExists) {
      throw new LessonNotFoundError();
    }

    const videos = await this.videosRepository.listLessonVideos(lessonId, tenantId);
    return videos.map((video) => this.mapVideoToResponse(video));
  }

  async createChapter(videoId: string, tenantId: string, data: CreateVideoChapterDto): Promise<VideoChapterDto> {
    await this.ensureVideoExists(videoId, tenantId);
    const chapter = await this.videosRepository.createChapter(videoId, tenantId, data);
    return this.mapChapterToResponse(chapter);
  }

  async listChapters(videoId: string, tenantId: string): Promise<VideoChapterDto[]> {
    await this.ensureVideoExists(videoId, tenantId);
    const chapters = await this.videosRepository.listChapters(videoId, tenantId);
    return chapters.map((chapter) => this.mapChapterToResponse(chapter));
  }

  async getChapterById(videoId: string, chapterId: string, tenantId: string): Promise<VideoChapterDto> {
    await this.ensureVideoExists(videoId, tenantId);
    const chapter = await this.videosRepository.findChapterById(videoId, chapterId, tenantId);

    if (!chapter) {
      throw new VideoChapterNotFoundError();
    }

    return this.mapChapterToResponse(chapter);
  }

  async updateChapter(videoId: string, chapterId: string, tenantId: string, data: UpdateVideoChapterDto): Promise<VideoChapterDto> {
    await this.ensureVideoExists(videoId, tenantId);
    const chapter = await this.videosRepository.updateChapter(videoId, chapterId, tenantId, data);

    if (!chapter) {
      throw new VideoChapterNotFoundError();
    }

    return this.mapChapterToResponse(chapter);
  }

  async deleteChapter(videoId: string, chapterId: string, tenantId: string): Promise<void> {
    await this.ensureVideoExists(videoId, tenantId);
    const deleted = await this.videosRepository.deleteChapter(videoId, chapterId, tenantId);

    if (!deleted) {
      throw new VideoChapterNotFoundError();
    }
  }

  async createSubtitle(videoId: string, tenantId: string, data: CreateVideoSubtitleDto): Promise<VideoSubtitleDto> {
    await this.ensureVideoExists(videoId, tenantId);
    const subtitle = await this.videosRepository.createSubtitle(videoId, tenantId, data);
    return this.mapSubtitleToResponse(subtitle);
  }

  async listSubtitles(videoId: string, tenantId: string): Promise<VideoSubtitleDto[]> {
    await this.ensureVideoExists(videoId, tenantId);
    const subtitles = await this.videosRepository.listSubtitles(videoId, tenantId);
    return subtitles.map((subtitle) => this.mapSubtitleToResponse(subtitle));
  }

  async getSubtitleById(videoId: string, subtitleId: string, tenantId: string): Promise<VideoSubtitleDto> {
    await this.ensureVideoExists(videoId, tenantId);
    const subtitle = await this.videosRepository.findSubtitleById(videoId, subtitleId, tenantId);

    if (!subtitle) {
      throw new VideoSubtitleNotFoundError();
    }

    return this.mapSubtitleToResponse(subtitle);
  }

  async updateSubtitle(videoId: string, subtitleId: string, tenantId: string, data: UpdateVideoSubtitleDto): Promise<VideoSubtitleDto> {
    await this.ensureVideoExists(videoId, tenantId);
    const subtitle = await this.videosRepository.updateSubtitle(videoId, subtitleId, tenantId, data);

    if (!subtitle) {
      throw new VideoSubtitleNotFoundError();
    }

    return this.mapSubtitleToResponse(subtitle);
  }

  async deleteSubtitle(videoId: string, subtitleId: string, tenantId: string): Promise<void> {
    await this.ensureVideoExists(videoId, tenantId);
    const deleted = await this.videosRepository.deleteSubtitle(videoId, subtitleId, tenantId);

    if (!deleted) {
      throw new VideoSubtitleNotFoundError();
    }
  }

  async getStatistics(tenantId: string): Promise<VideoStatisticsDto> {
    return this.videosRepository.getStatistics(tenantId);
  }

  private async ensureVideoExists(videoId: string, tenantId: string): Promise<VideoRecord> {
    const video = await this.videosRepository.findById(videoId, tenantId);

    if (!video) {
      throw new VideoNotFoundError();
    }

    return video;
  }

  private mapVideoToResponse(video: VideoRecord): VideoResponseDto {
    return {
      id: video.id,
      lessonId: video.lessonId,
      title: video.title,
      sourceUrl: video.sourceUrl,
      playbackUrl: video.sourceUrl,
      thumbnailUrl: video.thumbnailUrl,
      durationSeconds: video.durationSeconds,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    };
  }

  private mapChapterToResponse(chapter: VideoChapterRecord): VideoChapterDto {
    return {
      id: chapter.id,
      videoId: chapter.videoId,
      title: chapter.title,
      startSecond: chapter.startSecond,
      sortOrder: chapter.sortOrder,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
    };
  }

  private mapSubtitleToResponse(subtitle: VideoSubtitleRecord): VideoSubtitleDto {
    return {
      id: subtitle.id,
      videoId: subtitle.videoId,
      language: subtitle.language,
      label: subtitle.label,
      fileUrl: subtitle.fileUrl,
      isDefault: subtitle.isDefault,
      createdAt: subtitle.createdAt.toISOString(),
      updatedAt: subtitle.updatedAt.toISOString(),
    };
  }
}
