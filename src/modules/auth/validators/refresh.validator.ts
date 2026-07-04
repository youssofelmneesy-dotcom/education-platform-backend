import { z } from "zod";

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshRequestSchema = z.infer<typeof refreshRequestSchema>;
