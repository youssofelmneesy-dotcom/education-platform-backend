import type { CreateVideoRequestDto, VideoResponseDto, UpdateVideoRequestDto } from "../dto/index.js";
import type { IVideosRepository, IVideosService } from "../interfaces/index.js";
import type { VideoRecord } from "../types/index.js";
import { VideosRepository } from "../repositories/index.js";
import { VideoAlreadyExistsForLessonError, VideoNotFoundError, LessonNotFoundError } from "../utils/index.js";
import { prisma } from "../../../database/index.js";

export class VideosService implements IVideosService {
  constructor(private readonly videosRepository: IVideosRepository = new VideosRepository()) {}

  async create(tenantId: string, data: CreateVideoRequestDto): Promise<VideoResponseDto> {
    // Verify lesson exists
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: data.lessonId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    // Check if video already exists for this lesson (one-to-one relationship)
    const existing = await this.videosRepository.findByLessonId(data.lessonId, tenantId);

    if (existing) {
      throw new VideoAlreadyExistsForLessonError();
    }

    const video = await this.videosRepository.create(tenantId, data);

    return this.mapVideoToResponse(video);
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

  private mapVideoToResponse(video: VideoRecord): VideoResponseDto {
    return {
      id: video.id,
      lessonId: video.lessonId,
      title: video.title,
      sourceUrl: video.sourceUrl,
      thumbnailUrl: video.thumbnailUrl,
      durationSeconds: video.durationSeconds,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    };
  }
}
