import { prisma } from "../../../database/index.js";
import type { IProfilesRepository } from "../interfaces/index.js";
import type { ProfileRecord } from "../types/index.js";
import type { UpdateProfileDto } from "../dto/index.js";

export class ProfilesRepository implements IProfilesRepository {
  async findByUserId(userId: string, tenantId: string): Promise<ProfileRecord | null> {
    return prisma.profile.findFirst({
      where: {
        userId,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateByUserId(userId: string, tenantId: string, data: UpdateProfileDto): Promise<ProfileRecord | null> {
    return prisma.profile.update({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      data,
      select: {
        id: true,
        userId: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
