import { z } from "zod";

export const createPermissionSchema = z.object({
  resource: z.string().trim().min(1).max(100),
  action: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
});

export type CreatePermissionSchema = z.infer<typeof createPermissionSchema>;
