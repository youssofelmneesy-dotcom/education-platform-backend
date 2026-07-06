import { z } from "zod";

export const createVideoChapterSchema = z.object({
  title: z.string().trim().min(1).max(200),
  startSecond: z.number().int().min(0),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateVideoChapterSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  startSecond: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
