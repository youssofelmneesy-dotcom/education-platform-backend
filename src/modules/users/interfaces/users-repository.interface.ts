import type { UserRecord } from "../types/user.type.js";

export interface IUsersRepository {
  listByTenant(tenantId: string, page: number, limit: number): Promise<{ users: UserRecord[]; total: number }>;
  findById(id: string, tenantId: string): Promise<UserRecord | null>;
  updateById(id: string, tenantId: string, data: Partial<{ firstName: string; lastName: string }>): Promise<UserRecord | null>;
  softDeleteById(id: string, tenantId: string): Promise<void>;
}
