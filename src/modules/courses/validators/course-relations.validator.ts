import { z } from "zod";

export const replaceCourseCategoriesSchema = z.object({
  categoryIds: z.array(z.string().uuid()).default([]),
});

export const replaceCourseTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()).default([]),
});

export const assignCourseInstructorSchema = z.object({
  userId: z.string().uuid(),
  isPrimary: z.boolean().optional().default(false),
});

export const replaceCourseInstructorsSchema = z.object({
  instructors: z
    .array(
      z.object({
        userId: z.string().uuid(),
        isPrimary: z.boolean().optional().default(false),
      })
    )
    .default([]),
});

export type ReplaceCourseCategoriesSchema = z.infer<typeof replaceCourseCategoriesSchema>;
export type ReplaceCourseTagsSchema = z.infer<typeof replaceCourseTagsSchema>;
export type AssignCourseInstructorSchema = z.infer<typeof assignCourseInstructorSchema>;
export type ReplaceCourseInstructorsSchema = z.infer<typeof replaceCourseInstructorsSchema>;
