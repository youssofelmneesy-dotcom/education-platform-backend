import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../../../src/database/index.js";
import type { ILessonAttachmentsRepository } from "../../../src/modules/lesson-attachments/interfaces/index.js";
import { LessonAttachmentsService } from "../../../src/modules/lesson-attachments/services/index.js";
import type { LessonAttachmentRecord } from "../../../src/modules/lesson-attachments/types/index.js";
import { LessonAttachmentNotFoundError, LessonNotFoundError } from "../../../src/modules/lesson-attachments/utils/index.js";

vi.mock("../../../src/database/index.js", () => ({
  prisma: {
    lesson: {
      findFirst: vi.fn(),
    },
  },
}));

const tenantId = "tenant-id";
const lessonId = "lesson-id";
const attachmentId = "attachment-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function attachment(overrides: Partial<LessonAttachmentRecord> = {}): LessonAttachmentRecord {
  return {
    id: attachmentId,
    tenantId,
    lessonId,
    title: "Worksheet",
    fileUrl: "https://example.com/worksheet.pdf",
    fileType: "pdf",
    fileSize: 100,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function createRepository(): ILessonAttachmentsRepository {
  return {
    create: vi.fn().mockResolvedValue(attachment()),
    findById: vi.fn().mockResolvedValue(attachment()),
    findByLessonId: vi.fn().mockResolvedValue(attachment()),
    listByLesson: vi.fn().mockResolvedValue({ attachments: [attachment()], total: 1 }),
    updateById: vi.fn().mockResolvedValue(attachment({ title: "Updated" })),
    softDeleteById: vi.fn().mockResolvedValue(undefined),
  };
}

describe("LessonAttachmentsService", () => {
  let repository: ILessonAttachmentsRepository;
  let service: LessonAttachmentsService;

  beforeEach(() => {
    repository = createRepository();
    service = new LessonAttachmentsService(repository);
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: lessonId } as never);
  });

  it("creates attachments when the lesson exists", async () => {
    const result = await service.create(tenantId, { lessonId, title: "Worksheet", fileUrl: "https://example.com/worksheet.pdf" });

    expect(prisma.lesson.findFirst).toHaveBeenCalledWith({ where: { id: lessonId, tenantId, deletedAt: null } });
    expect(repository.create).toHaveBeenCalled();
    expect(result).toMatchObject({ id: attachmentId, title: "Worksheet", createdAt: now.toISOString() });
  });

  it("throws when creating or listing for a missing lesson", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue(null);

    await expect(service.create(tenantId, { lessonId, title: "Worksheet", fileUrl: "https://example.com/worksheet.pdf" })).rejects.toBeInstanceOf(LessonNotFoundError);
    await expect(service.listByLesson(tenantId, lessonId, 1, 10)).rejects.toBeInstanceOf(LessonNotFoundError);
  });

  it("lists attachments by lesson", async () => {
    const result = await service.listByLesson(tenantId, lessonId, 2, 5, "work");

    expect(repository.listByLesson).toHaveBeenCalledWith(tenantId, lessonId, 2, 5, "work");
    expect(result).toMatchObject({ total: 1, page: 2, limit: 5, attachments: [{ id: attachmentId }] });
  });

  it("gets and updates attachments", async () => {
    await expect(service.getById(attachmentId, tenantId)).resolves.toMatchObject({ id: attachmentId });
    await expect(service.updateById(attachmentId, tenantId, { title: "Updated" })).resolves.toMatchObject({ title: "Updated" });
  });

  it("throws for missing attachment reads and updates", async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(service.getById("missing", tenantId)).rejects.toBeInstanceOf(LessonAttachmentNotFoundError);
    await expect(service.updateById("missing", tenantId, { title: "Missing" })).rejects.toBeInstanceOf(LessonAttachmentNotFoundError);
  });

  it("deletes existing attachments", async () => {
    await expect(service.deleteById(attachmentId, tenantId)).resolves.toBeUndefined();
    expect(repository.softDeleteById).toHaveBeenCalledWith(attachmentId, tenantId);
  });
});
