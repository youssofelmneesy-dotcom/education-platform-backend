import type { CreateRoleRequestDto, UpdateRoleRequestDto } from "../dto/index.js";
import type { RoleRecord } from "../types/index.js";

export interface IRolesRepository {
  create(tenantId: string, data: CreateRoleRequestDto): Promise<RoleRecord>;
  findById(id: string, tenantId: string): Promise<RoleRecord | null>;
  findByName(name: string, tenantId: string): Promise<RoleRecord | null>;
  list(tenantId: string, page: number, limit: number): Promise<{ roles: RoleRecord[]; total: number }>;
  updateById(id: string, tenantId: string, data: UpdateRoleRequestDto): Promise<RoleRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
