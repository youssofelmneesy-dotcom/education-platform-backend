import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(120),
});

export type CreateTagSchema = z.infer<typeof createTagSchema>;
