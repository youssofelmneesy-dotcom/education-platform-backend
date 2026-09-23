import { beforeEach, describe, expect, it, vi } from "vitest";

import { PermissionsService } from "../../../src/modules/permissions/services/index.js";
import type { IPermissionsRepository } from "../../../src/modules/permissions/interfaces/index.js";
import type { PermissionRecord } from "../../../src/modules/permissions/types/index.js";
import { DuplicatePermissionError, PermissionNotFoundError } from "../../../src/modules/permissions/utils/index.js";

const tenantId = "tenant-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function permission(overrides: Partial<PermissionRecord> = {}): PermissionRecord {
  return {
    id: "permission-id",
    resource: "courses",
    action: "read",
    description: "Can read courses",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createRepository(): IPermissionsRepository {
  return {
    create: vi.fn().mockResolvedValue(permission()),
    findById: vi.fn().mockResolvedValue(permission()),
    findByResourceAction: vi.fn().mockResolvedValue(null),
    list: vi.fn().mockResolvedValue({ permissions: [permission()], total: 1 }),
    updateById: vi.fn().mockResolvedValue(permission({ action: "update" })),
    softDeleteById: vi.fn().mockResolvedValue(undefined),
  };
}

describe("PermissionsService", () => {
  let repository: IPermissionsRepository;
  let service: PermissionsService;

  beforeEach(() => {
    repository = createRepository();
    service = new PermissionsService(repository);
  });

  it("creates permissions when resource and action are unique", async () => {
    const result = await service.create(tenantId, { resource: "courses", action: "read", description: "Can read courses" });

    expect(repository.findByResourceAction).toHaveBeenCalledWith("courses", "read", tenantId);
    expect(repository.create).toHaveBeenCalledWith(tenantId, { resource: "courses", action: "read", description: "Can read courses" });
    expect(result).toMatchObject({ id: "permission-id", resource: "courses", action: "read", createdAt: now.toISOString() });
  });

  it("rejects duplicate permissions on create", async () => {
    vi.mocked(repository.findByResourceAction).mockResolvedValue(permission());

    await expect(service.create(tenantId, { resource: "courses", action: "read" })).rejects.toBeInstanceOf(DuplicatePermissionError);
  });

  it("lists and reads permissions", async () => {
    await expect(service.list(tenantId, 2, 5)).resolves.toMatchObject({ total: 1, page: 2, limit: 5, permissions: [{ id: "permission-id" }] });
    await expect(service.getById("permission-id", tenantId)).resolves.toMatchObject({ id: "permission-id", resource: "courses" });
  });

  it("throws when reading a missing permission", async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(service.getById("missing", tenantId)).rejects.toBeInstanceOf(PermissionNotFoundError);
  });

  it("updates permissions and checks the resulting resource/action pair", async () => {
    vi.mocked(repository.findByResourceAction).mockResolvedValue(permission({ id: "permission-id", action: "update" }));

    await expect(service.updateById("permission-id", tenantId, { action: "update" })).resolves.toMatchObject({ action: "update" });
    expect(repository.findByResourceAction).toHaveBeenCalledWith("courses", "update", tenantId);
  });

  it("rejects duplicate permissions on update", async () => {
    vi.mocked(repository.findByResourceAction).mockResolvedValue(permission({ id: "other-permission" }));

    await expect(service.updateById("permission-id", tenantId, { action: "read" })).rejects.toBeInstanceOf(DuplicatePermissionError);
  });

  it("throws when updating or deleting missing permissions", async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    await expect(service.updateById("missing", tenantId, { description: "x" })).rejects.toBeInstanceOf(PermissionNotFoundError);
    await expect(service.deleteById("missing", tenantId)).rejects.toBeInstanceOf(PermissionNotFoundError);
  });

  it("deletes existing permissions", async () => {
    await expect(service.deleteById("permission-id", tenantId)).resolves.toBeUndefined();
    expect(repository.softDeleteById).toHaveBeenCalledWith("permission-id", tenantId);
  });
});
