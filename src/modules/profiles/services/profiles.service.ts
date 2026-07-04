import type { ProfileDto, UpdateProfileDto } from "../dto/index.js";
import type { IProfilesRepository, IProfilesService } from "../interfaces/index.js";
import { ProfilesRepository } from "../repositories/index.js";
import { ProfileNotFoundError } from "../utils/index.js";

export class ProfilesService implements IProfilesService {
  constructor(private readonly profilesRepository: IProfilesRepository = new ProfilesRepository()) {}

  async getMyProfile(userId: string, tenantId: string): Promise<ProfileDto> {
    const profile = await this.profilesRepository.findByUserId(userId, tenantId);

    if (!profile) {
      throw new ProfileNotFoundError();
    }

    return {
      id: profile.id,
      userId: profile.userId,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  async updateMyProfile(userId: string, tenantId: string, data: UpdateProfileDto): Promise<ProfileDto> {
    const profile = await this.profilesRepository.updateByUserId(userId, tenantId, data);

    if (!profile) {
      throw new ProfileNotFoundError();
    }

    return {
      id: profile.id,
      userId: profile.userId,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
