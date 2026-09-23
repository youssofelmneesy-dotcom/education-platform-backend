import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfilesService } from "../../../src/modules/profiles/services/profiles.service.js";
import type { IProfilesRepository } from "../../../src/modules/profiles/interfaces/profiles-repository.interface.js";
import { ProfileNotFoundError } from "../../../src/modules/profiles/utils/index.js";

import type { Mock } from "vitest";

type MockRepository<T> = {
  [K in keyof T]: Mock;
};

function createRepositoryMock(): MockRepository<IProfilesRepository> {
  return {
    findByUserId: vi.fn(),
    updateByUserId: vi.fn(),
  } as unknown as MockRepository<IProfilesRepository>;
}

describe("ProfilesService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: ProfilesService;
  const tenantId = "tenant-123";
  const userId = "user-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new ProfilesService(repository);
    vi.restoreAllMocks();
  });

  describe("getMyProfile", () => {
    it("should return profile details", async () => {
      const profile = {
        id: "profile-1",
        userId,
        phone: "123456789",
        avatarUrl: "http://example.com/avatar.jpg",
        bio: "Hello world",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      repository.findByUserId.mockResolvedValue(profile);

      const result = await service.getMyProfile(userId, tenantId);

      expect(repository.findByUserId).toHaveBeenCalledWith(userId, tenantId);
      expect(result.id).toBe("profile-1");
      expect(result.bio).toBe("Hello world");
    });

    it("should throw ProfileNotFoundError when profile does not exist", async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.getMyProfile(userId, tenantId)).rejects.toThrow(ProfileNotFoundError);
    });
  });

  describe("updateMyProfile", () => {
    it("should update and return profile", async () => {
      const updateData = { bio: "New bio" };
      const updatedProfile = {
        id: "profile-1",
        userId,
        phone: "123456789",
        avatarUrl: "http://example.com/avatar.jpg",
        bio: "New bio",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      repository.updateByUserId.mockResolvedValue(updatedProfile);

      const result = await service.updateMyProfile(userId, tenantId, updateData);

      expect(repository.updateByUserId).toHaveBeenCalledWith(userId, tenantId, updateData);
      expect(result.bio).toBe("New bio");
    });

    it("should throw ProfileNotFoundError when updating non-existent profile", async () => {
      repository.updateByUserId.mockResolvedValue(null);

      await expect(service.updateMyProfile(userId, tenantId, { bio: "test" })).rejects.toThrow(ProfileNotFoundError);
    });
  });
});
