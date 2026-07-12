import bcrypt from "bcrypt";
import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService, verifyJwt } from "../../../src/modules/auth/services/auth.service.js";
import type { IAuthRepository } from "../../../src/modules/auth/interfaces/auth-repository.interface.js";

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest();

  return `${header}.${body}.${base64UrlEncode(signature)}`;
}

function createRepositoryMock(): IAuthRepository & {
  existsByEmail: ReturnType<typeof vi.fn>;
  findByEmailAndTenant: ReturnType<typeof vi.fn>;
  getAuthorizationContext: ReturnType<typeof vi.fn>;
  findRefreshTokenByUserAndTenant: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  saveRefreshToken: ReturnType<typeof vi.fn>;
  rotateRefreshToken: ReturnType<typeof vi.fn>;
  revokeRefreshToken: ReturnType<typeof vi.fn>;
} {
  return {
    existsByEmail: vi.fn(),
    findByEmailAndTenant: vi.fn(),
    getAuthorizationContext: vi.fn(),
    findRefreshTokenByUserAndTenant: vi.fn(),
    create: vi.fn(),
    saveRefreshToken: vi.fn(),
    rotateRefreshToken: vi.fn(),
    revokeRefreshToken: vi.fn(),
  };
}

beforeEach(() => {
  process.env.JWT_SECRET = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.TENANT_ID = "tenant-123";
  vi.restoreAllMocks();
});

describe("AuthService", () => {
  describe("register", () => {
    it("should return a created user when email is available", async () => {
      const repository = createRepositoryMock();
      repository.existsByEmail.mockResolvedValue(false);
      repository.create.mockResolvedValue({
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      });
      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

      const service = new AuthService(repository);
      const result = await service.register({
        firstName: "John",
        lastName: "Doe",
        email: "JOHN@example.com",
        password: "Password1!",
        confirmPassword: "Password1!",
      });

      expect(repository.existsByEmail).toHaveBeenCalledWith("john@example.com");
      expect(repository.create).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        passwordHash: "hashed-password",
      });
      expect(result).toEqual({
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should throw when email already exists", async () => {
      const repository = createRepositoryMock();
      repository.existsByEmail.mockResolvedValue(true);

      const service = new AuthService(repository);

      await expect(service.register({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password1!",
        confirmPassword: "Password1!",
      })).rejects.toThrow("Email already exists");
    });
  });

  describe("login", () => {
    it("should return tokens and user details on successful login", async () => {
      const repository = createRepositoryMock();
      repository.findByEmailAndTenant.mockResolvedValue({
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      });
      repository.saveRefreshToken.mockResolvedValue(undefined);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      vi.spyOn(bcrypt, "hash").mockResolvedValue("refresh-token-hash" as never);
      vi.spyOn(crypto, "randomBytes").mockReturnValue(Buffer.from("a".repeat(64), "utf8"));

      const service = new AuthService(repository);
      const result = await service.login({ email: "JOHN@example.com", password: "Password1!" });

      expect(repository.findByEmailAndTenant).toHaveBeenCalledWith("john@example.com", "00000000-0000-0000-0000-000000000000");
      expect(repository.saveRefreshToken).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toContain(".");
      expect(result.refreshToken).toContain(".");
      expect(result.user).toEqual({
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should throw when the user does not exist", async () => {
      const repository = createRepositoryMock();
      repository.findByEmailAndTenant.mockResolvedValue(null);

      const service = new AuthService(repository);

      await expect(service.login({ email: "john@example.com", password: "Password1!" })).rejects.toThrow("Invalid email or password");
    });

    it("should throw when the password is invalid", async () => {
      const repository = createRepositoryMock();
      repository.findByEmailAndTenant.mockResolvedValue({
        id: "user-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      });
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const service = new AuthService(repository);

      await expect(service.login({ email: "john@example.com", password: "wrong" })).rejects.toThrow("Invalid email or password");
    });
  });

  describe("refresh", () => {
    it("should rotate refresh tokens and return new tokens", async () => {
      const repository = createRepositoryMock();
      repository.findRefreshTokenByUserAndTenant.mockResolvedValue({
        id: "refresh-1",
        userId: "user-1",
        tenantId: "tenant-123",
        tokenHash: "stored-token-hash",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: null,
      });
      repository.rotateRefreshToken.mockResolvedValue(undefined);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      vi.spyOn(bcrypt, "hash").mockResolvedValue("new-refresh-token-hash" as never);
      vi.spyOn(crypto, "randomBytes").mockReturnValue(Buffer.from("b".repeat(64), "utf8"));

      const now = Math.floor(Date.now() / 1000);
      const refreshToken = signJwt({
        sub: "user-1",
        email: "john@example.com",
        tenantId: "tenant-123",
        token: "raw-refresh-token",
        type: "refresh",
        iat: now,
        exp: now + 3600,
      }, process.env.JWT_SECRET as string);

      const service = new AuthService(repository);
      const result = await service.refresh({ refreshToken });

      expect(repository.findRefreshTokenByUserAndTenant).toHaveBeenCalledWith("user-1", "tenant-123");
      expect(repository.rotateRefreshToken).toHaveBeenCalledWith("refresh-1", "new-refresh-token-hash", expect.any(Date));
      expect(result.accessToken).toContain(".");
      expect(result.refreshToken).toContain(".");
    });

    it("should throw when refresh token is invalid", async () => {
      const repository = createRepositoryMock();

      const service = new AuthService(repository);

      await expect(service.refresh({ refreshToken: "bad-token" })).rejects.toThrow("Invalid email or password");
    });
  });

  describe("logout", () => {
    it("should revoke the stored refresh token", async () => {
      const repository = createRepositoryMock();
      repository.findRefreshTokenByUserAndTenant.mockResolvedValue({
        id: "refresh-1",
        userId: "user-1",
        tenantId: "tenant-123",
        tokenHash: "stored-token-hash",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: null,
      });
      repository.revokeRefreshToken.mockResolvedValue(undefined);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const now = Math.floor(Date.now() / 1000);
      const refreshToken = signJwt({
        sub: "user-1",
        email: "john@example.com",
        tenantId: "tenant-123",
        token: "raw-refresh-token",
        type: "refresh",
        iat: now,
        exp: now + 3600,
      }, process.env.JWT_SECRET as string);

      const service = new AuthService(repository);

      await service.logout({ refreshToken });

      expect(repository.revokeRefreshToken).toHaveBeenCalledWith("refresh-1");
    });
  });

  describe("verifyJwt", () => {
    it("should verify a valid JWT payload", () => {
      const token = signJwt({ sub: "user-1", exp: Math.floor(Date.now() / 1000) + 60 }, process.env.JWT_SECRET as string);

      const payload = verifyJwt(token, process.env.JWT_SECRET as string);

      expect(payload.sub).toBe("user-1");
    });
  });
});
