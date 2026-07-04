import type { CreatePermissionRequestDto, UpdatePermissionRequestDto } from "../dto/index.js";
import type { PermissionRecord } from "../types/index.js";

export interface IPermissionsRepository {
  create(tenantId: string, data: CreatePermissionRequestDto): Promise<PermissionRecord>;
  findById(id: string, tenantId: string): Promise<PermissionRecord | null>;
  findByResourceAction(resource: string, action: string, tenantId: string): Promise<PermissionRecord | null>;
  list(tenantId: string, page: number, limit: number): Promise<{ permissions: PermissionRecord[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdatePermissionRequestDto): Promise<PermissionRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
