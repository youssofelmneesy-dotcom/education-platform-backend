import bcrypt from "bcrypt";
import crypto from "crypto";

import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  LogoutRequestDto,
} from "../dto/index.js";
import type { IAuthRepository, IAuthService } from "../interfaces/index.js";
import { AuthRepository } from "../repositories/index.js";
import { EmailAlreadyExistsError, InvalidCredentialsError } from "../utils/index.js";

const PASSWORD_SALT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 64;
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function parseTokenExpiry(value: string): number {
  const parsed = Number(value.replace(/[a-zA-Z]+$/, ""));
  const unit = value.replace(/[0-9.]/g, "");

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 3600;
  }

  switch (unit) {
    case "s":
      return parsed;
    case "m":
      return parsed * 60;
    case "h":
      return parsed * 60 * 60;
    case "d":
      return parsed * 60 * 60 * 24;
    default:
      return parsed;
  }
}

function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest();

  return `${header}.${body}.${base64UrlEncode(signature)}`;
}

export function verifyJwt(token: string, secret: string): Record<string, unknown> {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [header, body, signature] = parts;
  const expectedSignature = base64UrlEncode(crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest());

  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(base64UrlDecode(body)) as Record<string, unknown>;
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp !== "number" || payload.exp <= now) {
    throw new Error("Token expired");
  }

  return payload;
}

function getAccessToken(userId: string, email: string, tenantId: string): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";
  const expiresInSeconds = parseTokenExpiry(expiresIn);

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    email,
    tenantId,
    iat: now,
    exp: now + expiresInSeconds,
  };

  return signJwt(payload, secret);
}

function getRefreshToken(userId: string, email: string, tenantId: string, token: string): string {
  const secret = process.env.JWT_SECRET;
  const expiresInSeconds = REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    email,
    tenantId,
    token,
    type: "refresh",
    iat: now,
    exp: now + expiresInSeconds,
  };

  return signJwt(payload, secret);
}

function getRefreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
}

const DEFAULT_TENANT_ID = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";

export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository = new AuthRepository()) {}

  async register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
    const email = data.email.toLowerCase();
    const emailExists = await this.authRepository.existsByEmail(email);

    if (emailExists) {
      throw new EmailAlreadyExistsError();
    }

    const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
    const user = await this.authRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      passwordHash,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const email = data.email.toLowerCase();
    const tenantId = DEFAULT_TENANT_ID;
    const user = await this.authRepository.findByEmailAndTenant(email, tenantId);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = getAccessToken(user.id, user.email, tenantId);
    const refreshTokenRaw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const refreshToken = getRefreshToken(user.id, user.email, tenantId, refreshTokenRaw);
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, PASSWORD_SALT_ROUNDS);
    const expiresAt = getRefreshTokenExpiresAt();

    await this.authRepository.saveRefreshToken(user.id, refreshTokenHash, expiresAt, tenantId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async refresh(data: RefreshRequestDto): Promise<RefreshResponseDto> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    let payload: Record<string, unknown>;

    try {
      payload = verifyJwt(data.refreshToken, secret);
    } catch {
      throw new InvalidCredentialsError();
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.tenantId !== "string" ||
      payload.type !== "refresh" ||
      typeof payload.token !== "string"
    ) {
      throw new InvalidCredentialsError();
    }

    const userId = payload.sub;
    const email = payload.email;
    const tenantId = payload.tenantId;
    const refreshTokenRaw = payload.token;

    const storedToken = await this.authRepository.findRefreshTokenByUserAndTenant(userId, tenantId);

    if (!storedToken) {
      throw new InvalidCredentialsError();
    }

    const isValidToken = await bcrypt.compare(refreshTokenRaw, storedToken.tokenHash);

    if (!isValidToken) {
      throw new InvalidCredentialsError();
    }

    const newRefreshTokenRaw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const newRefreshToken = getRefreshToken(userId, email, tenantId, newRefreshTokenRaw);
    const newRefreshTokenHash = await bcrypt.hash(newRefreshTokenRaw, PASSWORD_SALT_ROUNDS);
    const expiresAt = getRefreshTokenExpiresAt();

    await this.authRepository.rotateRefreshToken(storedToken.id, newRefreshTokenHash, expiresAt);

    return {
      accessToken: getAccessToken(userId, email, tenantId),
      refreshToken: newRefreshToken,
    };
  }

  async logout(data: LogoutRequestDto): Promise<void> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    let payload: Record<string, unknown>;

    try {
      payload = verifyJwt(data.refreshToken, secret);
    } catch {
      throw new InvalidCredentialsError();
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.tenantId !== "string" ||
      payload.type !== "refresh" ||
      typeof payload.token !== "string"
    ) {
      throw new InvalidCredentialsError();
    }

    const userId = payload.sub;
    const tenantId = payload.tenantId;
    const refreshTokenRaw = payload.token;

    const storedToken = await this.authRepository.findRefreshTokenByUserAndTenant(userId, tenantId);

    if (!storedToken) {
      throw new InvalidCredentialsError();
    }

    const isValidToken = await bcrypt.compare(refreshTokenRaw, storedToken.tokenHash);

    if (!isValidToken) {
      throw new InvalidCredentialsError();
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);
  }
}
