import type { AuthUserRecord, CreateAuthUserData } from "../types/index.js";

export interface IAuthRepository {
  existsByEmail(email: string): Promise<boolean>;
  create(data: CreateAuthUserData): Promise<AuthUserRecord>;
}
