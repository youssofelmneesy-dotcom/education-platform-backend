import { z } from "zod";

export const courseIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const courseCategoryParamsSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
});

export const courseTagParamsSchema = z.object({
  id: z.string().uuid(),
  tagId: z.string().uuid(),
});

export const courseInstructorParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});
