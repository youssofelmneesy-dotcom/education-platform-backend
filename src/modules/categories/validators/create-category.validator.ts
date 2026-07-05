import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
