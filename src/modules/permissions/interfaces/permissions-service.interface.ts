import type { CreatePermissionRequestDto, PermissionResponseDto, PermissionsListResponseDto, UpdatePermissionRequestDto } from "../dto/index.js";

export interface IPermissionsService {
  create(tenantId: string, data: CreatePermissionRequestDto): Promise<PermissionResponseDto>;
  list(tenantId: string, page: number, limit: number): Promise<PermissionsListResponseDto>;
  getById(id: string, tenantId: string): Promise<PermissionResponseDto>;
  updateById(id: string, tenantId: string, data: UpdatePermissionRequestDto): Promise<PermissionResponseDto>;
  deleteById(id: string, tenantId: string): Promise<void>;
}
