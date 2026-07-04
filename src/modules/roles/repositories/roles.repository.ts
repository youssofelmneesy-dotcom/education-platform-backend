import { prisma } from "../../../database/index.js";
import type { CreateRoleRequestDto, UpdateRoleRequestDto } from "../dto/index.js";
import type { IRolesRepository } from "../interfaces/index.js";
import type { RoleRecord } from "../types/index.js";

export class RolesRepository implements IRolesRepository {
  async create(tenantId: string, data: CreateRoleRequestDto): Promise<RoleRecord> {
    return prisma.role.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description ?? null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<RoleRecord | null> {
    return prisma.role.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByName(name: string, tenantId: string): Promise<RoleRecord | null> {
    return prisma.role.findFirst({
      where: {
        tenantId,
        name,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async list(tenantId: string, page: number, limit: number): Promise<{ roles: RoleRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: {
          tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          isSystem: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.role.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),
    ]);

    return { roles, total };
  }

  async updateById(id: string, tenantId: string, data: UpdateRoleRequestDto): Promise<RoleRecord | null> {
    return prisma.role.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        name: data.name,
        description: data.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.role.update({
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
