import { z } from "zod";

export const courseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().min(1).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  instructorId: z.string().uuid().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "publishedAt", "durationSeconds"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CourseListQuerySchema = z.infer<typeof courseListQuerySchema>;
