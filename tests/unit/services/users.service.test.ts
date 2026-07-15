import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersService } from "../../../src/modules/users/services/users.service.js";
import type { IUsersRepository } from "../../../src/modules/users/interfaces/users-repository.interface.js";
import { ForbiddenError, NotFoundError } from "../../../src/modules/users/utils/index.js";

function createRepositoryMock(): IUsersRepository & {
  listByTenant: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  updateById: ReturnType<typeof vi.fn>;
  softDeleteById: ReturnType<typeof vi.fn>;
} {
  return {
    listByTenant: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    softDeleteById: vi.fn(),
  };
}

describe("UsersService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: UsersService;
  const tenantId = "tenant-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new UsersService(repository);
    vi.restoreAllMocks();
  });

  describe("listUsers", () => {
    it("should return a list of users", async () => {
      const users = [
        {
          id: "user-1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          isActive: true,
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
        },
      ];
      repository.listByTenant.mockResolvedValue({ users, total: 1 });

      const result = await service.listUsers(tenantId, 1, 10);

      expect(repository.listByTenant).toHaveBeenCalledWith(tenantId, 1, 10);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].id).toBe("user-1");
      expect(result.total).toBe(1);
    });
  });

  describe("getUserById", () => {
    it("should return user details when authorized (own profile)", async () => {
      const user = {
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        isActive: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      repository.findById.mockResolvedValue(user);

      const result = await service.getUserById("user-1", tenantId, "user-1", false);

      expect(repository.findById).toHaveBeenCalledWith("user-1", tenantId);
      expect(result.id).toBe("user-1");
    });

    it("should return user details when authorized (admin)", async () => {
      const user = {
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        isActive: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      repository.findById.mockResolvedValue(user);

      const result = await service.getUserById("user-1", tenantId, "admin-1", true);

      expect(result.id).toBe("user-1");
    });

    it("should throw ForbiddenError when not authorized", async () => {
      await expect(service.getUserById("user-1", tenantId, "other-user", false)).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getUserById("user-1", tenantId, "user-1", false)).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateUser", () => {
    const updateData = { firstName: "Jane" };

    it("should update and return user when authorized", async () => {
      const updatedUser = {
        id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        email: "john@example.com",
        isActive: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      repository.updateById.mockResolvedValue(updatedUser);

      const result = await service.updateUser("user-1", tenantId, "user-1", false, updateData);

      expect(repository.updateById).toHaveBeenCalledWith("user-1", tenantId, updateData);
      expect(result.firstName).toBe("Jane");
    });

    it("should throw ForbiddenError when not authorized", async () => {
      await expect(service.updateUser("user-1", tenantId, "other-user", false, updateData)).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      repository.updateById.mockResolvedValue(null);

      await expect(service.updateUser("user-1", tenantId, "user-1", false, updateData)).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteUser", () => {
    it("should delete user when authorized", async () => {
      repository.findById.mockResolvedValue({ id: "user-1" });
      repository.softDeleteById.mockResolvedValue(undefined);

      await service.deleteUser("user-1", tenantId, "user-1", false);

      expect(repository.softDeleteById).toHaveBeenCalledWith("user-1", tenantId);
    });

    it("should throw ForbiddenError when not authorized", async () => {
      await expect(service.deleteUser("user-1", tenantId, "other-user", false)).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser("user-1", tenantId, "user-1", false)).rejects.toThrow(NotFoundError);
    });
  });
});
