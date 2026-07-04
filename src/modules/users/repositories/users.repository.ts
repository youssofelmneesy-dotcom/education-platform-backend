import { prisma } from "../../../database/index.js";
import type { IUsersRepository } from "../interfaces/index.js";
import type { UserRecord } from "../types/user.type.js";

export class UsersRepository implements IUsersRepository {
  async listByTenant(tenantId: string, page: number, limit: number): Promise<{ users: UserRecord[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          tenantId,
          deletedAt: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({
        where: {
          tenantId,
          deletedAt: null,
        },
      }),
    ]);

    return { users, total };
  }

  async findById(id: string, tenantId: string): Promise<UserRecord | null> {
    return prisma.user.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateById(id: string, tenantId: string, data: Partial<{ firstName: string; lastName: string }>): Promise<UserRecord | null> {
    return prisma.user.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async softDeleteById(id: string, tenantId: string): Promise<void> {
    await prisma.user.update({
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
