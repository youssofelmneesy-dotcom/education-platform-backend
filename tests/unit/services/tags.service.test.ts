import { beforeEach, describe, expect, it, vi } from "vitest";

import { TagsService } from "../../../src/modules/tags/services/index.js";
import type { ITagsRepository } from "../../../src/modules/tags/interfaces/index.js";
import type { TagRecord } from "../../../src/modules/tags/types/index.js";
import { DuplicateTagSlugError, TagNotFoundError } from "../../../src/modules/tags/utils/index.js";

const tenantId = "tenant-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function tag(overrides: Partial<TagRecord> = {}): TagRecord {
  return {
    id: "tag-id",
    name: "TypeScript",
    slug: "typescript",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createRepository(): ITagsRepository {
  return {
    create: vi.fn().mockResolvedValue(tag()),
    findById: vi.fn().mockResolvedValue(tag()),
    findBySlug: vi.fn().mockResolvedValue(null),
    list: vi.fn().mockResolvedValue({ tags: [tag()], total: 1 }),
    updateById: vi.fn().mockResolvedValue(tag({ name: "Node.js", slug: "nodejs" })),
    softDeleteById: vi.fn().mockResolvedValue(undefined),
  };
}

describe("TagsService", () => {
  let repository: ITagsRepository;
  let service: TagsService;

  beforeEach(() => {
    repository = createRepository();
    service = new TagsService(repository);
  });

  it("creates tags when the slug is unique", async () => {
    const result = await service.create(tenantId, { name: "TypeScript", slug: "typescript" });

    expect(repository.findBySlug).toHaveBeenCalledWith("typescript", tenantId);
    expect(repository.create).toHaveBeenCalledWith(tenantId, { name: "TypeScript", slug: "typescript" });
    expect(result).toMatchObject({ id: "tag-id", name: "TypeScript", slug: "typescript", createdAt: now.toISOString() });
  });

  it("rejects duplicate tag slugs on create", async () => {
    vi.mocked(repository.findBySlug).mockResolvedValue(tag());

    await expect(service.create(tenantId, { name: "TypeScript", slug: "typescript" })).rejects.toBeInstanceOf(DuplicateTagSlugError);
  });

  it("lists and reads tags", async () => {
    await expect(service.list(tenantId, 2, 5)).resolves.toMatchObject({ total: 1, page: 2, limit: 5, tags: [{ id: "tag-id" }] });
    await expect(service.getById("tag-id", tenantId)).resolves.toMatchObject({ id: "tag-id", slug: "typescript" });
  });

  it("throws when reading a missing tag", async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(service.getById("missing", tenantId)).rejects.toBeInstanceOf(TagNotFoundError);
  });

  it("updates tags and allows keeping the same slug", async () => {
    vi.mocked(repository.findBySlug).mockResolvedValue(tag({ id: "tag-id", slug: "nodejs" }));

    await expect(service.updateById("tag-id", tenantId, { slug: "nodejs" })).resolves.toMatchObject({ slug: "nodejs" });
  });

  it("rejects duplicate tag slugs on update", async () => {
    vi.mocked(repository.findBySlug).mockResolvedValue(tag({ id: "other-tag" }));

    await expect(service.updateById("tag-id", tenantId, { slug: "typescript" })).rejects.toBeInstanceOf(DuplicateTagSlugError);
  });

  it("throws when updating or deleting missing tags", async () => {
    vi.mocked(repository.updateById).mockResolvedValue(null);
    await expect(service.updateById("missing", tenantId, { name: "Missing" })).rejects.toBeInstanceOf(TagNotFoundError);

    vi.mocked(repository.findById).mockResolvedValue(null);
    await expect(service.deleteById("missing", tenantId)).rejects.toBeInstanceOf(TagNotFoundError);
  });

  it("deletes existing tags", async () => {
    await expect(service.deleteById("tag-id", tenantId)).resolves.toBeUndefined();
    expect(repository.softDeleteById).toHaveBeenCalledWith("tag-id", tenantId);
  });
});
