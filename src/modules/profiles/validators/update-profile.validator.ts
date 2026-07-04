import { z } from "zod";

export const updateProfileSchema = z.object({
  phone: z.string().trim().max(30).nullable().optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
