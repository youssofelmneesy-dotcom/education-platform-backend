import { z } from "zod";

export const updateVideoSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  sourceUrl: z.string().trim().url().optional(),
  thumbnailUrl: z.string().trim().url().nullable().optional(),
  durationSeconds: z.number().int().min(0).nullable().optional(),
});

export type UpdateVideoSchema = z.infer<typeof updateVideoSchema>;
