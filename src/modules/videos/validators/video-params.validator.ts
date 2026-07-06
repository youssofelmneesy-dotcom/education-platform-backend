import { z } from "zod";

export const videoIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const lessonIdParamsSchema = z.object({
  lessonId: z.string().uuid(),
});

export const videoChapterParamsSchema = z.object({
  id: z.string().uuid(),
  chapterId: z.string().uuid(),
});

export const videoSubtitleParamsSchema = z.object({
  id: z.string().uuid(),
  subtitleId: z.string().uuid(),
});
