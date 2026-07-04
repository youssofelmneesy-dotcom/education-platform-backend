import type { ProfileRecord } from "../types/index.js";
import type { UpdateProfileDto } from "../dto/index.js";

export interface IProfilesRepository {
  findByUserId(userId: string, tenantId: string): Promise<ProfileRecord | null>;
  updateByUserId(userId: string, tenantId: string, data: UpdateProfileDto): Promise<ProfileRecord | null>;
}
