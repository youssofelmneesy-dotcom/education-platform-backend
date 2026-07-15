import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { cleanupTestUser, findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `lessons-${testRunId}@example.com`;
const forbiddenEmail = `lessons-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const lessonPermissions = [
  "lessons:create",
  "lessons:list",
  "lessons:read",
  "lessons:update",
  "lessons:delete",
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

async function grantLessonPermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: {
      tenantId,
      name: `lesson-tester-${testRunId}`,
      description: "Lesson integration test role",
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
    lessonPermissions.map(async (permissionName) => {
      const permission = await prisma.permission.create({
        data: {
          tenantId,
          resource: "lessons",
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

async function createParentCourse(slug: string) {
  return prisma.course.create({
    data: {
      tenantId,
      title: `Course ${slug}`,
      slug,
      status: "draft",
    },
  });
}

async function createLesson(token: string, courseId: string, slug: string) {
  return request(app)
    .post(`/api/courses/${courseId}/lessons`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      courseId,
      title: `Lesson ${slug}`,
      slug,
      description: `Description for ${slug}`,
      content: `Content for ${slug}`,
      sortOrder: 1,
      durationSeconds: 600,
      isPreview: false,
    });
}

describe("Lessons API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;
  let courseId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Lesson", "Tester", authorizedEmail);
    await registerTestUser("Lesson", "Forbidden", forbiddenEmail);
    await grantLessonPermissions(authorizedEmail);
    const course = await createParentCourse(`lessons-parent-${testRunId}`);

    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
    courseId = course.id;
  });

  afterAll(async () => {
    await cleanupTestUser(authorizedEmail);
    await cleanupTestUser(forbiddenEmail);
  });

  describe("POST /api/courses/:courseId/lessons", () => {
    it("creates a lesson", async () => {
      // Arrange
      const slug = `create-${testRunId}`;

      // Act
      const response = await createLesson(accessToken, courseId, slug);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        courseId,
        title: `Lesson ${slug}`,
        slug,
        description: `Description for ${slug}`,
        content: `Content for ${slug}`,
        sortOrder: 1,
        durationSeconds: 600,
        isPreview: false,
      });
    });

    it("rejects invalid payloads", async () => {
      // Act
      const response = await request(app)
        .post(`/api/courses/${courseId}/lessons`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          courseId,
          title: "",
          slug: "",
          sortOrder: -1,
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects unauthenticated requests", async () => {
      // Act
      const response = await request(app).post(`/api/courses/${courseId}/lessons`).send({
        courseId,
        title: "Unauthorized",
        slug: `unauthorized-${testRunId}`,
      });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects duplicate lesson slugs within the same course", async () => {
      // Arrange
      const slug = `duplicate-${testRunId}`;

      // Act
      const firstResponse = await createLesson(accessToken, courseId, slug);
      const secondResponse = await createLesson(accessToken, courseId, slug);

      // Assert
      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
    });

    it("returns not found when parent course does not exist", async () => {
      // Act
      const response = await createLesson(accessToken, "00000000-0000-0000-0000-000000000000", `missing-course-${testRunId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/courses/:courseId/lessons", () => {
    it("lists lessons for a course", async () => {
      // Arrange
      await createLesson(accessToken, courseId, `list-${testRunId}`);

      // Act
      const response = await request(app)
        .get(`/api/courses/${courseId}/lessons`)
        .query({ page: 1, limit: 5, search: "Lesson" })
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lessons).toEqual(expect.any(Array));
      expect(response.body.data.total).toEqual(expect.any(Number));
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(5);
    });

    it("rejects unauthenticated requests", async () => {
      // Act
      const response = await request(app).get(`/api/courses/${courseId}/lessons`);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/courses/:courseId/lessons/:id", () => {
    it("returns a lesson by id", async () => {
      // Arrange
      const slug = `get-${testRunId}`;
      const createResponse = await createLesson(accessToken, courseId, slug);

      // Act
      const response = await request(app)
        .get(`/api/courses/${courseId}/lessons/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createResponse.body.data.id,
        courseId,
        title: `Lesson ${slug}`,
        slug,
      });
    });

    it("returns not found for missing lessons", async () => {
      // Act
      const response = await request(app)
        .get(`/api/courses/${courseId}/lessons/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/courses/:courseId/lessons/:id", () => {
    it("updates a lesson", async () => {
      // Arrange
      const createResponse = await createLesson(accessToken, courseId, `update-${testRunId}`);
      const updatedSlug = `updated-${testRunId}`;

      // Act
      const response = await request(app)
        .patch(`/api/courses/${courseId}/lessons/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Updated Lesson",
          slug: updatedSlug,
          description: "Updated description",
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createResponse.body.data.id,
        title: "Updated Lesson",
        slug: updatedSlug,
        description: "Updated description",
      });
    });

    it("returns validation errors for invalid updates", async () => {
      // Arrange
      const createResponse = await createLesson(accessToken, courseId, `invalid-update-${testRunId}`);

      // Act
      const response = await request(app)
        .patch(`/api/courses/${courseId}/lessons/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "" });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("returns not found for missing lessons", async () => {
      // Act
      const response = await request(app)
        .patch(`/api/courses/${courseId}/lessons/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Missing Lesson" });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/courses/:courseId/lessons/:id", () => {
    it("deletes a lesson", async () => {
      // Arrange
      const createResponse = await createLesson(accessToken, courseId, `delete-${testRunId}`);

      // Act
      const deleteResponse = await request(app)
        .delete(`/api/courses/${courseId}/lessons/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);
      const getResponse = await request(app)
        .get(`/api/courses/${courseId}/lessons/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(deleteResponse.status).toBe(204);
      expect(getResponse.status).toBe(404);
    });

    it("returns not found for missing lessons", async () => {
      // Act
      const response = await request(app)
        .delete(`/api/courses/${courseId}/lessons/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Authorization", () => {
    it("returns forbidden when the user lacks lesson permissions", async () => {
      // Act
      const response = await request(app)
        .get(`/api/courses/${courseId}/lessons`)
        .set("Authorization", `Bearer ${forbiddenAccessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
