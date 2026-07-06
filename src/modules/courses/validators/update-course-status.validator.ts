import { z } from "zod";

export const updateCourseStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export type UpdateCourseStatusSchema = z.infer<typeof updateCourseStatusSchema>;
