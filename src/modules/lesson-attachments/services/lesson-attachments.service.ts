import { prisma } from "../../../database/index.js";
import type { CreateLessonAttachmentRequestDto, LessonAttachmentResponseDto, LessonAttachmentsListResponseDto, UpdateLessonAttachmentRequestDto } from "../dto/index.js";
import type { ILessonAttachmentsRepository, ILessonAttachmentsService } from "../interfaces/index.js";
import type { LessonAttachmentRecord } from "../types/index.js";
import { LessonAttachmentNotFoundError, LessonNotFoundError } from "../utils/index.js";
import { LessonAttachmentsRepository } from "../repositories/index.js";

export class LessonAttachmentsService implements ILessonAttachmentsService {
  constructor(private readonly lessonAttachmentsRepository: ILessonAttachmentsRepository = new LessonAttachmentsRepository()) {}

  async create(tenantId: string, data: CreateLessonAttachmentRequestDto): Promise<LessonAttachmentResponseDto> {
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

    const attachment = await this.lessonAttachmentsRepository.create(tenantId, data);
    return this.mapAttachmentToResponse(attachment);
  }

  async listByLesson(tenantId: string, lessonId: string, page: number, limit: number, search?: string): Promise<LessonAttachmentsListResponseDto> {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!lesson) {
      throw new LessonNotFoundError();
    }

    const { attachments, total } = await this.lessonAttachmentsRepository.listByLesson(tenantId, lessonId, page, limit, search);

    return {
      attachments: attachments.map((attachment) => this.mapAttachmentToResponse(attachment)),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, tenantId: string): Promise<LessonAttachmentResponseDto> {
    const attachment = await this.lessonAttachmentsRepository.findById(id, tenantId);

    if (!attachment) {
      throw new LessonAttachmentNotFoundError();
    }

    return this.mapAttachmentToResponse(attachment);
  }

  async updateById(id: string, tenantId: string, data: UpdateLessonAttachmentRequestDto): Promise<LessonAttachmentResponseDto> {
    const attachment = await this.lessonAttachmentsRepository.findById(id, tenantId);

    if (!attachment) {
      throw new LessonAttachmentNotFoundError();
    }

    const updated = await this.lessonAttachmentsRepository.updateById(id, tenantId, data);

    if (!updated) {
      throw new LessonAttachmentNotFoundError();
    }

    return this.mapAttachmentToResponse(updated);
  }

  async deleteById(id: string, tenantId: string): Promise<void> {
    const attachment = await this.lessonAttachmentsRepository.findById(id, tenantId);

    if (!attachment) {
      throw new LessonAttachmentNotFoundError();
    }

    await this.lessonAttachmentsRepository.softDeleteById(id, tenantId);
  }

  private mapAttachmentToResponse(attachment: LessonAttachmentRecord): LessonAttachmentResponseDto {
    return {
      id: attachment.id,
      lessonId: attachment.lessonId,
      title: attachment.title,
      fileUrl: attachment.fileUrl,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      sortOrder: attachment.sortOrder,
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    };
  }
}
