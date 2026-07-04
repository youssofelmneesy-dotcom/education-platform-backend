import { z } from "zod";

export const updatePermissionSchema = z.object({
  resource: z.string().trim().min(1).max(100).optional(),
  action: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export type UpdatePermissionSchema = z.infer<typeof updatePermissionSchema>;
