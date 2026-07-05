import { prisma } from "../../../database/index.js";
import type { CreateCategoryRequestDto, UpdateCategoryRequestDto } from "../dto/index.js";
import type { ICategoriesRepository } from "../interfaces/index.js";
import type { CategoryRecord } from "../types/index.js";

export class CategoriesRepository implements ICategoriesRepository {
  async create(tenantId: string, data: CreateCategoryRequestDto): Promise<CategoryRecord> {
    return prisma.category.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<CategoryRecord | null> {
    return prisma.category.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string, tenantId: string): Promise<CategoryRecord | null> {
    return prisma.category.findFirst({
      where: {
        tenantId,
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async list(tenantId: string, page: number, limit: number): Promise<{ categories: CategoryRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: {
          tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.category.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),
    ]);

    return { categories, total };
  }

  async updateById(id: string, tenantId: string, data: UpdateCategoryRequestDto): Promise<CategoryRecord | null> {
    return prisma.category.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.category.update({
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
