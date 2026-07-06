import { z } from "zod";

export const videoListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().min(1).optional(),
    lessonId: z.string().uuid().optional(),
    minDurationSeconds: z.coerce.number().int().min(0).optional(),
    maxDurationSeconds: z.coerce.number().int().min(0).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "title", "durationSeconds"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .refine((query) => query.minDurationSeconds === undefined || query.maxDurationSeconds === undefined || query.minDurationSeconds <= query.maxDurationSeconds, {
    message: "minDurationSeconds must be less than or equal to maxDurationSeconds",
    path: ["minDurationSeconds"],
  });
