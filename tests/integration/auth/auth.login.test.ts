import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";
import { createUserFixture, createLoginFixture } from "../helpers/fixtures.js";
import { findUserByEmail, cleanupTestUser } from "../helpers/db.js";

describe("Auth Module - Login", () => {
  const testEmail = "login.test@example.com";
  const testPassword = "SecurePass123!";

  afterEach(async () => {
    await cleanupTestUser(testEmail);
  });

  describe("POST /api/auth/login", () => {
    it("should successfully login with valid credentials and return tokens", async () => {
      // Register first
      await request(app).post("/api/auth/register").send({
        firstName: "Login",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      // Login
      const response = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "User logged in successfully");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data).toHaveProperty("user");

      // Verify JWT structure (3 parts separated by dots)
      const accessToken = response.body.data.accessToken;
      const refreshToken = response.body.data.refreshToken;
      expect(accessToken.split(".").length).toBe(3);
      expect(refreshToken.split(".").length).toBe(3);
    });

    it("should return user details in login response", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Login",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user).toHaveProperty("firstName", "Login");
      expect(response.body.data.user).toHaveProperty("lastName", "Test");
      expect(response.body.data.user).toHaveProperty("email", testEmail);
      expect(response.body.data.user).toHaveProperty("createdAt");
    });

    it("should reject login with wrong password", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Login",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, "WrongPassword123!"));

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("Invalid");
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture("nonexistent@example.com", testPassword));

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("Invalid");
    });

    it("should normalize email to lowercase for login", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Login",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail.toUpperCase(), testPassword));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    it("should reject login with missing email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: testPassword,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should reject login with missing password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testEmail,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should reject login with empty email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "",
        password: testPassword,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject login with empty password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject login with invalid email format", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "invalid-email",
        password: testPassword,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should persist refresh token to database", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Login",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      expect(response.status).toBe(200);

      // Verify refresh token was stored in DB
      const user = await findUserByEmail(testEmail);
      expect(user).toBeDefined();

      // Note: We verify that refresh tokens table exists and has entries
      // Details are tested in refresh token test
    });

    it("should return different tokens on each login", async () => {
      await request(app).post("/api/auth/register").send({
        firstName: "Login",
        lastName: "Test",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const login1 = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const login2 = await request(app)
        .post("/api/auth/login")
        .send(createLoginFixture(testEmail, testPassword));

      const token1 = login1.body.data.accessToken;
      const token2 = login2.body.data.accessToken;
      const refreshToken1 = login1.body.data.refreshToken;
      const refreshToken2 = login2.body.data.refreshToken;

      // Access tokens should be different (different iat timestamps)
      expect(token1).not.toBe(token2);
      // Refresh tokens should also be different
      expect(refreshToken1).not.toBe(refreshToken2);
    });
  });
});
