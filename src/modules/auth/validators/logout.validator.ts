import { z } from "zod";

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LogoutRequestSchema = z.infer<typeof logoutRequestSchema>;
