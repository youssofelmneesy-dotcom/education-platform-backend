import { z } from "zod";

export const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().min(1).max(220).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  thumbnailUrl: z.string().trim().max(500).nullable().optional(),
  status: z.string().trim().max(30).optional(),
  language: z.string().trim().max(20).nullable().optional(),
  durationSeconds: z.number().int().min(0).nullable().optional(),
});

export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
