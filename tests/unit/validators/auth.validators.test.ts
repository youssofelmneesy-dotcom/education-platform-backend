import { describe, expect, it } from "vitest";
import { loginRequestSchema } from "../../../src/modules/auth/validators/login.validator.js";
import { logoutRequestSchema } from "../../../src/modules/auth/validators/logout.validator.js";
import { refreshRequestSchema } from "../../../src/modules/auth/validators/refresh.validator.js";
import { registerRequestSchema } from "../../../src/modules/auth/validators/register.validator.js";

describe("auth validators", () => {
  describe("loginRequestSchema", () => {
    it("should accept a valid login payload", () => {
      const result = loginRequestSchema.parse({ email: "user@example.com", password: "secret123" });

      expect(result).toEqual({ email: "user@example.com", password: "secret123" });
    });

    it("should reject an invalid email", () => {
      expect(() => loginRequestSchema.parse({ email: "bad-email", password: "secret123" })).toThrow();
    });

    it("should reject missing required fields", () => {
      expect(() => loginRequestSchema.parse({ email: "user@example.com" })).toThrow();
    });

    it("should reject invalid types", () => {
      expect(() => loginRequestSchema.parse({ email: 123, password: false })).toThrow();
    });

    it("should reject an empty password", () => {
      expect(() => loginRequestSchema.parse({ email: "user@example.com", password: "" })).toThrow();
    });
  });

  describe("registerRequestSchema", () => {
    const validPayload = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    };

    it("should accept a valid register payload", () => {
      const result = registerRequestSchema.parse(validPayload);

      expect(result).toEqual(validPayload);
    });

    it("should reject an invalid email", () => {
      expect(() => registerRequestSchema.parse({ ...validPayload, email: "bad-email" })).toThrow();
    });

    it("should reject missing required fields", () => {
      expect(() => registerRequestSchema.parse({ email: validPayload.email, password: validPayload.password, confirmPassword: validPayload.confirmPassword })).toThrow();
    });

    it("should reject invalid types", () => {
      expect(() => registerRequestSchema.parse({ firstName: 1, lastName: true, email: {}, password: [], confirmPassword: null })).toThrow();
    });

    it("should enforce boundary values", () => {
      expect(() => registerRequestSchema.parse({ ...validPayload, firstName: "J", lastName: "D", password: "short1!", confirmPassword: "short1!" })).toThrow();
    });
  });

  describe("refreshRequestSchema", () => {
    it("should accept a valid refresh payload", () => {
      const result = refreshRequestSchema.parse({ refreshToken: "token-value" });

      expect(result).toEqual({ refreshToken: "token-value" });
    });

    it("should reject missing required fields", () => {
      expect(() => refreshRequestSchema.parse({})).toThrow();
    });

    it("should reject invalid types", () => {
      expect(() => refreshRequestSchema.parse({ refreshToken: 123 })).toThrow();
    });

    it("should reject an empty refresh token", () => {
      expect(() => refreshRequestSchema.parse({ refreshToken: "" })).toThrow();
    });
  });

  describe("logoutRequestSchema", () => {
    it("should accept a valid logout payload", () => {
      const result = logoutRequestSchema.parse({ refreshToken: "token-value" });

      expect(result).toEqual({ refreshToken: "token-value" });
    });

    it("should reject missing required fields", () => {
      expect(() => logoutRequestSchema.parse({})).toThrow();
    });

    it("should reject invalid types", () => {
      expect(() => logoutRequestSchema.parse({ refreshToken: false })).toThrow();
    });

    it("should reject an empty refresh token", () => {
      expect(() => logoutRequestSchema.parse({ refreshToken: "" })).toThrow();
    });
  });
});
