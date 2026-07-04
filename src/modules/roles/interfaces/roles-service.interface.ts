import type { CreateRoleRequestDto, RoleResponseDto, RolesListResponseDto, UpdateRoleRequestDto } from "../dto/index.js";

export interface IRolesService {
  create(tenantId: string, data: CreateRoleRequestDto): Promise<RoleResponseDto>;
  list(tenantId: string, page: number, limit: number): Promise<RolesListResponseDto>;
  getById(id: string, tenantId: string): Promise<RoleResponseDto>;
  updateById(id: string, tenantId: string, data: UpdateRoleRequestDto): Promise<RoleResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
