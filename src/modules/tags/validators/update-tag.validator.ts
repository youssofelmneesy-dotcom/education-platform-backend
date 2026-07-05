import { z } from "zod";

export const updateTagSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
});

export type UpdateTagSchema = z.infer<typeof updateTagSchema>;
