import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";
import { createLoginFixture, createLogoutFixture } from "../helpers/fixtures.js";
import { cleanupTestUser } from "../helpers/db.js";

describe("Auth Module - Logout", () => {
  const testEmail = "logout.test@example.com";
  const testPassword = "SecurePass123!";

  afterEach(async () => {
    await cleanupTestUser(testEmail);
  });

  describe("POST /api/auth/logout", () => {
    it("should successfully logout with valid refresh token", async () => {
      // Register
      await request(app).post("/api/auth/register").send({
        firstName: "Logout",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      // Login
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const refreshToken = loginResponse.body.data.refreshToken;

      // Logout
      const response = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture(refreshToken));

      expect(response.status).toBe(204);
      // 204 No Content should have empty body
      expect(response.body).toEqual({});
    });

    it("should return 204 No Content on successful logout", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Logout",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const response = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture(loginResponse.body.data.refreshToken));

      expect(response.status).toBe(204);
    });

    it("should revoke refresh token after logout", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Logout",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const refreshToken = loginResponse.body.data.refreshToken;

      // Logout
      await request(app).post("/api/auth/logout").send(createLogoutFixture(refreshToken));

      // Try to refresh with revoked token
      const refreshResponse = await request(app)
        .post("/api/auth/refresh")
        .send({
          refreshToken,
        });

      expect(refreshResponse.status).toBe(401);
      expect(refreshResponse.body).toHaveProperty("success", false);
    });

    it("should reject logout with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture("invalid.token.here"));

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject logout with malformed refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture("notavalidjwt"));

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject logout with missing refresh token", async () => {
      const response = await request(app).post("/api/auth/logout").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should reject logout with empty refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture(""));

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject logout with already revoked token", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Logout",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const refreshToken = loginResponse.body.data.refreshToken;

      // First logout
      await request(app).post("/api/auth/logout").send(createLogoutFixture(refreshToken));

      // Second logout with same token
      const response = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture(refreshToken));

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should allow revoking specific refresh token", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Logout",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      // Create a login session
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const refreshToken = loginResponse.body.data.refreshToken;

      // Logout this session
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .send(createLogoutFixture(refreshToken));

      expect(logoutResponse.status).toBe(204);

      // Token should now be revoked
      const refreshResponse = await request(app).post("/api/auth/refresh").send({
        refreshToken,
      });

      expect(refreshResponse.status).toBe(401);
    });
  });
});
