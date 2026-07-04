import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export type CreateRoleSchema = z.infer<typeof createRoleSchema>;
