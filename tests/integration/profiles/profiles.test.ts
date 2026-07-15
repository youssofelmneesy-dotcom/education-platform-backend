import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../src/app.js";
import { cleanupTestUser } from "../helpers/db.js";
import { prisma } from "../../../src/database/index.js";

describe("Profiles Module - Integration", () => {
  let userToken: string;
  let userEmail = "profile.test@example.com";
  const password = "SecurePass123!";

  beforeAll(async () => {
    // 1. Create User
    await request(app).post("/api/auth/register").send({
      firstName: "Profile",
      lastName: "Test",
      email: userEmail,
      password,
      confirmPassword: password,
    });
    const login = await request(app).post("/api/auth/login").send({ email: userEmail, password });
    userToken = login.body.data.accessToken;
    const userId = login.body.data.user.id;

    // Retrieve user record to get tenantId
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (userRecord) {
      // 2. Create profile for the user
      await prisma.profile.create({
        data: {
          tenantId: userRecord.tenantId,
          userId: userRecord.id,
          bio: "Initial Bio",
        },
      });
    }
  });

  afterAll(async () => {
    await cleanupTestUser(userEmail);
  });

  describe("GET /api/profiles/me", () => {
    it("should return the current user's profile", async () => {
      const response = await request(app)
        .get("/api/profiles/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("userId");
    });
  });

  describe("PATCH /api/profiles/me", () => {
    it("should update the current user's profile", async () => {
      const bio = "Updated bio";
      const response = await request(app)
        .patch("/api/profiles/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ bio });

      expect(response.status).toBe(200);
      expect(response.body.data.bio).toBe(bio);
    });

    it("should return 400 for invalid data", async () => {
      const response = await request(app)
        .patch("/api/profiles/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ avatarUrl: "invalid-url" });

      expect(response.status).toBe(400);
    });
  });
});
