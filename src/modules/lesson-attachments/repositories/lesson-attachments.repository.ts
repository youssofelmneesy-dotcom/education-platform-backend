import { prisma } from "../../../database/index.js";
import type { CreateLessonAttachmentRequestDto, UpdateLessonAttachmentRequestDto } from "../dto/index.js";
import type { ILessonAttachmentsRepository } from "../interfaces/index.js";
import type { LessonAttachmentRecord } from "../types/index.js";

const lessonAttachmentSelect = {
  id: true,
  lessonId: true,
  title: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class LessonAttachmentsRepository implements ILessonAttachmentsRepository {
  async create(tenantId: string, data: CreateLessonAttachmentRequestDto): Promise<LessonAttachmentRecord> {
    return prisma.lessonAttachment.create({
      data: {
        tenantId,
        lessonId: data.lessonId,
        title: data.title,
        fileUrl: data.fileUrl,
        fileType: data.fileType ?? null,
        fileSize: data.fileSize ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
      select: lessonAttachmentSelect,
    });
  }

  async findById(id: string, tenantId: string): Promise<LessonAttachmentRecord | null> {
    return prisma.lessonAttachment.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: lessonAttachmentSelect,
    });
  }

  async findByLessonId(lessonId: string, tenantId: string): Promise<LessonAttachmentRecord | null> {
    return prisma.lessonAttachment.findFirst({
      where: {
        lessonId,
        tenantId,
        deletedAt: null,
      },
      select: lessonAttachmentSelect,
    });
  }

  async listByLesson(tenantId: string, lessonId: string, page: number, limit: number, search?: string): Promise<{ attachments: LessonAttachmentRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause = {
      tenantId,
      lessonId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { fileType: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [attachments, total] = await Promise.all([
      prisma.lessonAttachment.findMany({
        where: whereClause,
        select: lessonAttachmentSelect,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.lessonAttachment.count({ where: whereClause }),
    ]);

    return { attachments, total };
  }

  async updateById(id: string, tenantId: string, data: UpdateLessonAttachmentRequestDto): Promise<LessonAttachmentRecord | null> {
    const existing = await this.findById(id, tenantId);

    if (!existing) {
      return null;
    }

    return prisma.lessonAttachment.update({
      where: { id },
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        fileType: data.fileType ?? undefined,
        fileSize: data.fileSize ?? undefined,
        sortOrder: data.sortOrder,
      },
      select: lessonAttachmentSelect,
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    const existing = await this.findById(id, tenantId);

    if (!existing) {
      return;
    }

    await prisma.lessonAttachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
