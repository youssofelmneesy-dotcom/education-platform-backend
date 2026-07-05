import { z } from "zod";

export const createVideoSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().trim().max(200).nullable().optional(),
  sourceUrl: z.string().trim().url(),
  thumbnailUrl: z.string().trim().url().nullable().optional(),
  durationSeconds: z.number().int().min(0).nullable().optional(),
});

export type CreateVideoSchema = z.infer<typeof createVideoSchema>;
