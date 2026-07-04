import { z } from "zod";

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
