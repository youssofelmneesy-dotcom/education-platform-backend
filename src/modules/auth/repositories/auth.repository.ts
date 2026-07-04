import { prisma } from "../../../database/index.js";
import type { IAuthRepository } from "../interfaces/index.js";
import type { AuthUserRecord, CreateAuthUserData } from "../types/index.js";

export class AuthRepository implements IAuthRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user !== null;
  }

  async create(data: CreateAuthUserData): Promise<AuthUserRecord> {
    return prisma.user.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
