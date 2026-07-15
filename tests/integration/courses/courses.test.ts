import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { cleanupTestUser, findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `courses-${testRunId}@example.com`;
const forbiddenEmail = `courses-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const coursePermissions = [
  "courses:create",
  "courses:list",
  "courses:read",
  "courses:update",
  "courses:delete",
];

async function ensureDefaultTenant() {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: "Test Tenant",
      slug: "test-tenant",
    },
  });
}

async function registerTestUser(firstName: string, lastName: string, email: string) {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      firstName,
      lastName,
      email,
      password,
      confirmPassword: password,
    });

  expect(response.status).toBe(201);
}

async function grantCoursePermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: {
      tenantId,
      name: `course-tester-${testRunId}`,
      description: "Course integration test role",
    },
  });

  await prisma.userRole.create({
    data: {
      tenantId,
      userId: user.id,
      roleId: role.id,
    },
  });

  await Promise.all(
    coursePermissions.map(async (permissionName) => {
      const permission = await prisma.permission.create({
        data: {
          tenantId,
          resource: "courses",
          action: permissionName.split(":")[1] ?? permissionName,
          description: `${permissionName} permission`,
        },
      });

      await prisma.rolePermission.create({
        data: {
          tenantId,
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    })
  );
}

async function createCourse(token: string, slug: string) {
  return request(app)
    .post("/api/courses")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: `Course ${slug}`,
      slug,
      description: `Description for ${slug}`,
      shortDescription: `Short ${slug}`,
      thumbnailUrl: "https://example.com/course.png",
      status: "draft",
      language: "en",
      durationSeconds: 3600,
    });
}

describe("Courses API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Course", "Tester", authorizedEmail);
    await registerTestUser("Course", "Forbidden", forbiddenEmail);
    await grantCoursePermissions(authorizedEmail);

    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
  });

  afterAll(async () => {
    await cleanupTestUser(authorizedEmail);
    await cleanupTestUser(forbiddenEmail);
  });

  describe("POST /api/courses", () => {
    it("creates a course", async () => {
      // Arrange
      const slug = `create-${testRunId}`;

      // Act
      const response = await createCourse(accessToken, slug);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: `Course ${slug}`,
        slug,
        description: `Description for ${slug}`,
        shortDescription: `Short ${slug}`,
        status: "draft",
        language: "en",
        durationSeconds: 3600,
      });
      expect(response.body.data.id).toEqual(expect.any(String));
    });

    it("rejects invalid payloads", async () => {
      // Act
      const response = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "",
          slug: "",
          durationSeconds: -1,
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects unauthenticated requests", async () => {
      // Act
      const response = await request(app).post("/api/courses").send({
        title: "Unauthorized",
        slug: `unauthorized-${testRunId}`,
      });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects duplicate course slugs", async () => {
      // Arrange
      const slug = `duplicate-${testRunId}`;

      // Act
      const firstResponse = await createCourse(accessToken, slug);
      const secondResponse = await createCourse(accessToken, slug);

      // Assert
      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
    });
  });

  describe("GET /api/courses", () => {
    it("lists courses with pagination metadata", async () => {
      // Arrange
      await createCourse(accessToken, `list-${testRunId}`);

      // Act
      const response = await request(app)
        .get("/api/courses")
        .query({ page: 1, limit: 5, search: "Course" })
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toEqual(expect.any(Array));
      expect(response.body.data.total).toEqual(expect.any(Number));
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(5);
    });

    it("rejects unauthenticated requests", async () => {
      // Act
      const response = await request(app).get("/api/courses");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/courses/:id", () => {
    it("returns a course by id", async () => {
      // Arrange
      const slug = `get-${testRunId}`;
      const createResponse = await createCourse(accessToken, slug);

      // Act
      const response = await request(app)
        .get(`/api/courses/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createResponse.body.data.id,
        title: `Course ${slug}`,
        slug,
      });
    });

    it("returns not found for missing courses", async () => {
      // Act
      const response = await request(app)
        .get("/api/courses/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/courses/:id", () => {
    it("updates a course", async () => {
      // Arrange
      const createResponse = await createCourse(accessToken, `update-${testRunId}`);
      const updatedSlug = `updated-${testRunId}`;

      // Act
      const response = await request(app)
        .patch(`/api/courses/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Updated Course",
          slug: updatedSlug,
          description: "Updated description",
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createResponse.body.data.id,
        title: "Updated Course",
        slug: updatedSlug,
        description: "Updated description",
      });
    });

    it("returns validation errors for invalid updates", async () => {
      // Arrange
      const createResponse = await createCourse(accessToken, `invalid-update-${testRunId}`);

      // Act
      const response = await request(app)
        .patch(`/api/courses/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "" });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("returns not found for missing courses", async () => {
      // Act
      const response = await request(app)
        .patch("/api/courses/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Missing Course" });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/courses/:id", () => {
    it("deletes a course", async () => {
      // Arrange
      const createResponse = await createCourse(accessToken, `delete-${testRunId}`);

      // Act
      const deleteResponse = await request(app)
        .delete(`/api/courses/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);
      const getResponse = await request(app)
        .get(`/api/courses/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(deleteResponse.status).toBe(204);
      expect(getResponse.status).toBe(404);
    });

    it("returns not found for missing courses", async () => {
      // Act
      const response = await request(app)
        .delete("/api/courses/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Authorization", () => {
    it("returns forbidden when the user lacks course permissions", async () => {
      // Act
      const response = await request(app)
        .get("/api/courses")
        .set("Authorization", `Bearer ${forbiddenAccessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
