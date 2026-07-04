import type { ProfileDto, UpdateProfileDto } from "../dto/index.js";

export interface IProfilesService {
  getMyProfile(userId: string, tenantId: string): Promise<ProfileDto>;
  updateMyProfile(userId: string, tenantId: string, data: UpdateProfileDto): Promise<ProfileDto>;
}
