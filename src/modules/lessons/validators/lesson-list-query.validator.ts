import { z } from "zod";

export const lessonListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().min(1).optional(),
  status: z.enum(["draft", "published"]).optional(),
  isPreview: z.coerce.boolean().optional(),
  sortBy: z.enum(["sortOrder", "createdAt", "updatedAt", "title", "publishedAt", "durationSeconds"]).optional().default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type LessonListQuerySchema = z.infer<typeof lessonListQuerySchema>;
