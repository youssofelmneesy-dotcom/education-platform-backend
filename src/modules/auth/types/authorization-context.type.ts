import type { AuthenticatedUserPayload } from "../middleware/auth.middleware.js";

export type PermissionKey = `${string}:${string}`;

export interface AuthorizationContext {
  user: AuthenticatedUserPayload;
  roles: string[];
  permissions: PermissionKey[];
}
