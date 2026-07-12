import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";
import { createUserFixture, createInvalidEmailFixture, createWeakPasswordFixture } from "../helpers/fixtures.js";
import { findUserByEmail, cleanupTestUser } from "../helpers/db.js";

describe("Auth Module - Registration", () => {
  afterEach(async () => {
    // Clean up test users after each test
    const testEmails = [
      "john.doe@example.com",
      "jane.smith@example.com",
      "bob.wilson@example.com",
      "alice@example.com",
    ];
    for (const email of testEmails) {
      await cleanupTestUser(email);
    }
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user with valid data", async () => {
      const userData = createUserFixture({
        email: "john.doe@example.com",
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "User registered successfully");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("firstName", userData.firstName);
      expect(response.body.data).toHaveProperty("lastName", userData.lastName);
      expect(response.body.data).toHaveProperty("email", userData.email);
      expect(response.body.data).toHaveProperty("createdAt");

      // Verify user was persisted to database
      const userInDb = await findUserByEmail(userData.email);
      expect(userInDb).toBeDefined();
      expect(userInDb?.firstName).toBe(userData.firstName);
      expect(userInDb?.lastName).toBe(userData.lastName);
    });

    it("should reject duplicate email with 409 conflict error", async () => {
      const userData = createUserFixture({
        email: "jane.smith@example.com",
      });

      // First registration should succeed
      await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      // Second registration with same email should fail
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Different",
        lastName: "User",
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("already exists");
    });

    it("should reject invalid email format", async () => {
      const userData = createInvalidEmailFixture({
        email: "invalid-email",
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("errors");
    });

    it("should reject weak password (less than 8 characters)", async () => {
      const userData = createUserFixture({
        email: "bob.wilson@example.com",
        password: "Pass1!",
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should reject password without uppercase letter", async () => {
      const userData = createUserFixture({
        email: "alice@example.com",
        password: "securepass123!",
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should reject password without lowercase letter", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "SECUREPASS123!",
        confirmPassword: "SECUREPASS123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject password without number", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass!",
        confirmPassword: "SecurePass!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject password without special character", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass123",
        confirmPassword: "SecurePass123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject mismatched confirm password", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "DifferentPass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject missing firstName", async () => {
      const response = await request(app).post("/api/auth/register").send({
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("should reject missing lastName", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject missing email", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject missing password", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        confirmPassword: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should reject missing confirmPassword", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should validate firstName length (minimum 2 characters)", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "A",
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should validate firstName length (maximum 50 characters)", async () => {
      const response = await request(app).post("/api/auth/register").send({
        firstName: "A".repeat(51),
        lastName: "User",
        email: "test@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should accept firstName with exactly 2 characters", async () => {
      const userData = createUserFixture({
        email: "user2char@example.com",
        firstName: "Jo",
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
    });

    it("should accept firstName with exactly 50 characters", async () => {
      const userData = createUserFixture({
        email: "user50char@example.com",
        firstName: "A".repeat(50),
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
    });

    it("should normalize email to lowercase", async () => {
      const email = "UPPERCASE@EXAMPLE.COM";
      const userData = createUserFixture({
        email,
      });

      const response = await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
      });

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe(email.toLowerCase());

      // Verify in DB that email is lowercase
      const userInDb = await findUserByEmail(email.toLowerCase());
      expect(userInDb).toBeDefined();
    });

    it("should hash password and not store plaintext", async () => {
      const userData = createUserFixture({
        email: "hashed@example.com",
      });
      const plainPassword = userData.password;

      await request(app).post("/api/auth/register").send({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: plainPassword,
        confirmPassword: plainPassword,
      });

      const userInDb = await findUserByEmail(userData.email);
      expect(userInDb?.passwordHash).toBeDefined();
      expect(userInDb?.passwordHash).not.toBe(plainPassword);
    });
  });
});
