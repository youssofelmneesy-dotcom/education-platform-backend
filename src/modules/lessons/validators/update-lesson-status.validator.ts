import { z } from "zod";

export const updateLessonStatusSchema = z.object({
  status: z.enum(["draft", "published"]),
});

export type UpdateLessonStatusSchema = z.infer<typeof updateLessonStatusSchema>;
