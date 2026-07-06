import { z } from "zod";

export const courseLessonsParamsSchema = z.object({
  courseId: z.string().uuid(),
});

export const lessonParamsSchema = z.object({
  courseId: z.string().uuid(),
  id: z.string().uuid(),
});
