import { z } from "zod";

export const updateLessonSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().min(1).max(220).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  content: z.string().trim().max(50000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  durationSeconds: z.number().int().min(0).nullable().optional(),
  isPreview: z.boolean().optional(),
});

export type UpdateLessonSchema = z.infer<typeof updateLessonSchema>;
