import { beforeEach, describe, expect, it, vi } from "vitest";

import { RolesService } from "../../../src/modules/roles/services/index.js";
import type { IRolesRepository } from "../../../src/modules/roles/interfaces/index.js";
import type { RoleRecord } from "../../../src/modules/roles/types/index.js";
import { DuplicateRoleNameError, RoleNotFoundError } from "../../../src/modules/roles/utils/index.js";

const tenantId = "tenant-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function role(overrides: Partial<RoleRecord> = {}): RoleRecord {
  return {
    id: "role-id",
    name: "Teacher",
    description: "Can teach",
    isSystem: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createRepository(): IRolesRepository {
  return {
    create: vi.fn().mockResolvedValue(role()),
    findById: vi.fn().mockResolvedValue(role()),
    findByName: vi.fn().mockResolvedValue(null),
    list: vi.fn().mockResolvedValue({ roles: [role()], total: 1 }),
    updateById: vi.fn().mockResolvedValue(role({ name: "Updated" })),
    softDeleteById: vi.fn().mockResolvedValue(undefined),
  };
}

describe("RolesService", () => {
  let repository: IRolesRepository;
  let service: RolesService;

  beforeEach(() => {
    repository = createRepository();
    service = new RolesService(repository);
  });

  it("creates roles when the name is unique", async () => {
    const result = await service.create(tenantId, { name: "Teacher", description: "Can teach" });

    expect(repository.findByName).toHaveBeenCalledWith("Teacher", tenantId);
    expect(repository.create).toHaveBeenCalledWith(tenantId, { name: "Teacher", description: "Can teach" });
    expect(result).toMatchObject({ id: "role-id", name: "Teacher", createdAt: now.toISOString() });
  });

  it("rejects duplicate role names on create", async () => {
    vi.mocked(repository.findByName).mockResolvedValue(role());

    await expect(service.create(tenantId, { name: "Teacher" })).rejects.toBeInstanceOf(DuplicateRoleNameError);
  });

  it("lists and reads roles", async () => {
    await expect(service.list(tenantId, 2, 5)).resolves.toMatchObject({ total: 1, page: 2, limit: 5, roles: [{ id: "role-id" }] });
    await expect(service.getById("role-id", tenantId)).resolves.toMatchObject({ id: "role-id", name: "Teacher" });
  });

  it("throws when reading a missing role", async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(service.getById("missing", tenantId)).rejects.toBeInstanceOf(RoleNotFoundError);
  });

  it("updates roles and allows keeping the same name", async () => {
    vi.mocked(repository.findByName).mockResolvedValue(role({ id: "role-id", name: "Updated" }));

    await expect(service.updateById("role-id", tenantId, { name: "Updated" })).resolves.toMatchObject({ name: "Updated" });
  });

  it("rejects duplicate role names on update", async () => {
    vi.mocked(repository.findByName).mockResolvedValue(role({ id: "other-role" }));

    await expect(service.updateById("role-id", tenantId, { name: "Teacher" })).rejects.toBeInstanceOf(DuplicateRoleNameError);
  });

  it("throws when updating or deleting missing roles", async () => {
    vi.mocked(repository.updateById).mockResolvedValue(null);
    await expect(service.updateById("missing", tenantId, { description: "x" })).rejects.toBeInstanceOf(RoleNotFoundError);

    vi.mocked(repository.findById).mockResolvedValue(null);
    await expect(service.deleteById("missing", tenantId)).rejects.toBeInstanceOf(RoleNotFoundError);
  });

  it("deletes existing roles", async () => {
    await expect(service.deleteById("role-id", tenantId)).resolves.toBeUndefined();
    expect(repository.softDeleteById).toHaveBeenCalledWith("role-id", tenantId);
  });
});
