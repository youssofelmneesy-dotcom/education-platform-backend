import { prisma } from "../../../database/index.js";
import type { CreatePermissionRequestDto, UpdatePermissionRequestDto } from "../dto/index.js";
import type { IPermissionsRepository } from "../interfaces/index.js";
import type { PermissionRecord } from "../types/index.js";

export class PermissionsRepository implements IPermissionsRepository {
  async create(tenantId: string, data: CreatePermissionRequestDto): Promise<PermissionRecord> {
    return prisma.permission.create({
      data: {
        tenantId,
        resource: data.resource,
        action: data.action,
        description: data.description ?? null,
      },
      select: {
        id: true,
        resource: true,
        action: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<PermissionRecord | null> {
    return prisma.permission.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        resource: true,
        action: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByResourceAction(resource: string, action: string, tenantId: string): Promise<PermissionRecord | null> {
    return prisma.permission.findFirst({
      where: {
        tenantId,
        resource,
        action,
        deletedAt: null,
      },
      select: {
        id: true,
        resource: true,
        action: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async list(tenantId: string, page: number, limit: number): Promise<{ permissions: PermissionRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where: {
          tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
          resource: true,
          action: true,
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
      prisma.permission.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),
    ]);

    return { permissions, total };
  }

  async updateById(id: string, tenantId: string, data: UpdatePermissionRequestDto): Promise<PermissionRecord | null> {
    return prisma.permission.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        resource: data.resource,
        action: data.action,
        description: data.description,
      },
      select: {
        id: true,
        resource: true,
        action: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.permission.update({
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
