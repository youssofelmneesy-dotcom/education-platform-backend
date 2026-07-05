import { z } from "zod";

export const createLessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220),
  description: z.string().trim().max(5000).nullable().optional(),
  content: z.string().trim().max(50000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  durationSeconds: z.number().int().min(0).nullable().optional(),
  isPreview: z.boolean().optional().default(false),
});

export type CreateLessonSchema = z.infer<typeof createLessonSchema>;
