import type { RoleResponseDto } from "./role-response.dto.js";

export interface RolesListResponseDto {
  roles: RoleResponseDto[];
  total: number;
  page: number;
  limit: number;
}
