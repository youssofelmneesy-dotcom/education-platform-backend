import { z } from "zod";

export const createLessonAttachmentSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  fileUrl: z.string().trim().url(),
  fileType: z.string().trim().max(100).nullable().optional(),
  fileSize: z.number().int().min(0).nullable().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export type CreateLessonAttachmentSchema = z.infer<typeof createLessonAttachmentSchema>;
