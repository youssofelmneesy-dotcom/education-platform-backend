import type { PermissionResponseDto } from "./permission-response.dto.js";

export interface PermissionsListResponseDto {
  permissions: PermissionResponseDto[];
  total: number;
  page: number;
  limit: number;
}
