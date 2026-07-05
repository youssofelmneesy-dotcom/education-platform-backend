import { prisma } from "../../../database/index.js";
import type { CreateTagRequestDto, UpdateTagRequestDto } from "../dto/index.js";
import type { ITagsRepository } from "../interfaces/index.js";
import type { TagRecord } from "../types/index.js";

export class TagsRepository implements ITagsRepository {
  async create(tenantId: string, data: CreateTagRequestDto): Promise<TagRecord> {
    return prisma.tag.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<TagRecord | null> {
    return prisma.tag.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string, tenantId: string): Promise<TagRecord | null> {
    return prisma.tag.findFirst({
      where: {
        tenantId,
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async list(tenantId: string, page: number, limit: number): Promise<{ tags: TagRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where: {
          tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.tag.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),
    ]);

    return { tags, total };
  }

  async updateById(id: string, tenantId: string, data: UpdateTagRequestDto): Promise<TagRecord | null> {
    return prisma.tag.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        name: data.name,
        slug: data.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.tag.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
