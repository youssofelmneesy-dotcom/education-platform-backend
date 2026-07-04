import { prisma } from "../../../database/index.js";
import type { IAuthRepository } from "../interfaces/index.js";
import type { AuthUserRecord, CreateAuthUserData, RefreshTokenRecord } from "../types/index.js";

const DEFAULT_TENANT_ID = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";

export class AuthRepository implements IAuthRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: DEFAULT_TENANT_ID,
          email,
        },
      },
      select: { id: true },
    });

    return user !== null;
  }

  async findByEmailAndTenant(email: string, tenantId: string): Promise<(AuthUserRecord & { passwordHash: string }) | null> {
    return prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
  }

  async findRefreshTokenByUserAndTenant(userId: string, tenantId: string): Promise<RefreshTokenRecord | null> {
    return prisma.refreshToken.findFirst({
      where: {
        tenantId,
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        userId: true,
        tenantId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: CreateAuthUserData): Promise<AuthUserRecord> {
    return prisma.user.create({
      data: {
        tenantId: DEFAULT_TENANT_ID,
        ...data,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date, tenantId: string): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        tenantId,
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async rotateRefreshToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: {
        tokenHash,
        expiresAt,
        revokedAt: null,
      },
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
