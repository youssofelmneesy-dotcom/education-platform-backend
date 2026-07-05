import { z } from "zod";

export const updateLessonAttachmentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  fileUrl: z.string().trim().url().optional(),
  fileType: z.string().trim().max(100).nullable().optional(),
  fileSize: z.number().int().min(0).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateLessonAttachmentSchema = z.infer<typeof updateLessonAttachmentSchema>;
