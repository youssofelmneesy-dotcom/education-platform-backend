import type { AuthUserRecord, CreateAuthUserData, RefreshTokenRecord } from "../types/index.js";

export interface IAuthRepository {
  existsByEmail(email: string): Promise<boolean>;
  findByEmailAndTenant(email: string, tenantId: string): Promise<(AuthUserRecord & { passwordHash: string }) | null>;
  findRefreshTokenByUserAndTenant(userId: string, tenantId: string): Promise<RefreshTokenRecord | null>;
  create(data: CreateAuthUserData): Promise<AuthUserRecord>;
  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date, tenantId: string): Promise<void>;
  rotateRefreshToken(id: string, tokenHash: string, expiresAt: Date): Promise<void>;
  revokeRefreshToken(id: string): Promise<void>;
}
