import { z } from "zod";

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
