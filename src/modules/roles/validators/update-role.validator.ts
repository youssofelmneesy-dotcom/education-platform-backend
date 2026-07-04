import { z } from "zod";

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;
