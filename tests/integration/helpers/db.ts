import { prisma } from "../../../src/database/index.js";

/**
 * Database utilities for integration tests
 */

export async function findUserByEmail(email: string) {
  const DEFAULT_TENANT_ID = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
  return prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId: DEFAULT_TENANT_ID,
        email,
      },
    },
  });
}

export async function getUserRefreshToken(userId: string) {
  return prisma.refreshToken.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function revokeAllUserRefreshTokens(userId: string) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function cleanupTestUser(email: string) {
  const DEFAULT_TENANT_ID = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
  const user = await findUserByEmail(email);

  if (user) {
    // Revoke all refresh tokens first
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Delete the user
    await prisma.user.delete({
      where: {
        tenantId_email: {
          tenantId: DEFAULT_TENANT_ID,
          email,
        },
      },
    });
  }
}
