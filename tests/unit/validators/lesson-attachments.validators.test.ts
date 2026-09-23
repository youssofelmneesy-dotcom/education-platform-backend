import { describe, expect, it } from "vitest";

import { createLessonAttachmentSchema, updateLessonAttachmentSchema } from "../../../src/modules/lesson-attachments/validators/index.js";

const lessonId = "11111111-1111-4111-8111-111111111111";

describe("lesson attachments validators", () => {
  it("validates create attachment payloads", () => {
    const result = createLessonAttachmentSchema.parse({
      lessonId,
      title: "Worksheet",
      fileUrl: "https://example.com/worksheet.pdf",
      fileType: "pdf",
      fileSize: 100,
    });

    expect(result.sortOrder).toBe(0);
  });

  it("rejects invalid create attachment payloads", () => {
    expect(createLessonAttachmentSchema.safeParse({ lessonId: "bad-id", title: "Worksheet", fileUrl: "https://example.com/a.pdf" }).success).toBe(false);
    expect(createLessonAttachmentSchema.safeParse({ lessonId, title: "", fileUrl: "https://example.com/a.pdf" }).success).toBe(false);
    expect(createLessonAttachmentSchema.safeParse({ lessonId, title: "Worksheet", fileUrl: "not-url" }).success).toBe(false);
    expect(createLessonAttachmentSchema.safeParse({ lessonId, title: "Worksheet", fileUrl: "https://example.com/a.pdf", fileSize: -1 }).success).toBe(false);
  });

  it("validates partial update attachment payloads", () => {
    expect(updateLessonAttachmentSchema.safeParse({ title: "Updated" }).success).toBe(true);
    expect(updateLessonAttachmentSchema.safeParse({ fileType: null }).success).toBe(true);
    expect(updateLessonAttachmentSchema.safeParse({ sortOrder: 1 }).success).toBe(true);
    expect(updateLessonAttachmentSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid update attachment payloads", () => {
    expect(updateLessonAttachmentSchema.safeParse({ title: "" }).success).toBe(false);
    expect(updateLessonAttachmentSchema.safeParse({ fileUrl: "not-url" }).success).toBe(false);
    expect(updateLessonAttachmentSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
  });
});
