import type { PermissionKey } from "../types/index.js";

export type PermissionCheckMode = "any" | "all";

export function normalizeAuthorizationValue(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePermission(permission: string): PermissionKey {
  return normalizeAuthorizationValue(permission) as PermissionKey;
}

export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  const roleSet = new Set(userRoles.map(normalizeAuthorizationValue));
  return requiredRoles.map(normalizeAuthorizationValue).some((role) => roleSet.has(role));
}

export function hasPermissions(userPermissions: string[], requiredPermissions: string[], mode: PermissionCheckMode): boolean {
  const permissionSet = new Set(userPermissions.map(normalizePermission));
  const normalizedRequiredPermissions = requiredPermissions.map(normalizePermission);

  if (mode === "any") {
    return normalizedRequiredPermissions.some((permission) => permissionSet.has(permission));
  }

  return normalizedRequiredPermissions.every((permission) => permissionSet.has(permission));
}
