import { z } from "zod";

export const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1),
});

export type ReorderLessonsSchema = z.infer<typeof reorderLessonsSchema>;
