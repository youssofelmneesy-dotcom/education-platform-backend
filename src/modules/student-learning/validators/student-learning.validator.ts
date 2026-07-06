import { z } from "zod";

export const lessonIdParamsSchema = z.object({
  lessonId: z.string().uuid(),
});

export const noteIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const courseIdParamsSchema = z.object({
  courseId: z.string().uuid(),
});

export const updateLessonProgressSchema = z.object({
  watchedSeconds: z.number().int().min(0),
  progressPercent: z.number().int().min(0).max(100),
});

export const lessonNoteSchema = z.object({
  content: z.string().trim().min(1).max(10000),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().min(1).optional(),
});

export const limitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
