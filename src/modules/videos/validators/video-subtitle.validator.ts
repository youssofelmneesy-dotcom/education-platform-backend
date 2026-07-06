import { z } from "zod";

export const createVideoSubtitleSchema = z.object({
  language: z.string().trim().min(1).max(20),
  label: z.string().trim().max(100).nullable().optional(),
  fileUrl: z.string().trim().url(),
  isDefault: z.boolean().optional(),
});

export const updateVideoSubtitleSchema = z.object({
  language: z.string().trim().min(1).max(20).optional(),
  label: z.string().trim().max(100).nullable().optional(),
  fileUrl: z.string().trim().url().optional(),
  isDefault: z.boolean().optional(),
});
