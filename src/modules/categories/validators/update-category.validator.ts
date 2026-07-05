import { z } from "zod";

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
