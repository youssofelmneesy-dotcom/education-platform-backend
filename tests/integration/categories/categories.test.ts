import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { cleanupTestUser, findUserByEmail } from "../helpers/db.js";
import { getAuthToken } from "../helpers/auth.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `categories-${testRunId}@example.com`;
const forbiddenEmail = `categories-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const categoryPermissions = [
  "categories:create",
  "categories:list",
  "categories:read",
  "categories:update",
  "categories:delete",
];

async function createCategory(token: string, slug: string) {
  return request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: `Category ${slug}`,
      slug,
      description: `Description for ${slug}`,
    });
}

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

async function grantCategoryPermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: {
      tenantId,
      name: `category-tester-${testRunId}`,
      description: "Category integration test role",
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
    categoryPermissions.map(async (permissionName) => {
      const permission = await prisma.permission.create({
        data: {
          tenantId,
          resource: "categories",
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

describe("Categories API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Category", "Tester", authorizedEmail);
    await registerTestUser("Category", "Forbidden", forbiddenEmail);
    await grantCategoryPermissions(authorizedEmail);

    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
  });

  afterAll(async () => {
    await cleanupTestUser(authorizedEmail);
    await cleanupTestUser(forbiddenEmail);
  });

  describe("POST /api/categories", () => {
    it("creates a category", async () => {
      const slug = `create-${testRunId}`;

      const response = await createCategory(accessToken, slug);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: `Category ${slug}`,
        slug,
        description: `Description for ${slug}`,
      });
      expect(response.body.data.id).toEqual(expect.any(String));
      expect(response.body.data.createdAt).toEqual(expect.any(String));
      expect(response.body.data.updatedAt).toEqual(expect.any(String));
    });

    it("returns validation errors for invalid payloads", async () => {
      const response = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "",
          slug: "",
          description: "a".repeat(501),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(app).post("/api/categories").send({
        name: "Unauthorized",
        slug: `unauthorized-${testRunId}`,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects duplicate category slugs", async () => {
      const slug = `duplicate-${testRunId}`;

      const firstResponse = await createCategory(accessToken, slug);
      const secondResponse = await createCategory(accessToken, slug);

      expect(firstResponse.status).toBe(201);
      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
    });
  });

  describe("GET /api/categories", () => {
    it("lists categories with pagination metadata", async () => {
      await createCategory(accessToken, `list-${testRunId}`);

      const response = await request(app)
        .get("/api/categories")
        .query({ page: 1, limit: 5 })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toEqual(expect.any(Array));
      expect(response.body.data.total).toEqual(expect.any(Number));
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(5);
    });

    it("rejects unauthenticated requests", async () => {
      const response = await request(app).get("/api/categories");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/categories/:id", () => {
    it("returns a category by id", async () => {
      const slug = `get-${testRunId}`;
      const createResponse = await createCategory(accessToken, slug);

      const response = await request(app)
        .get(`/api/categories/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createResponse.body.data.id,
        name: `Category ${slug}`,
        slug,
      });
    });

    it("returns not found for missing categories", async () => {
      const response = await request(app)
        .get("/api/categories/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("updates a category", async () => {
      const createResponse = await createCategory(accessToken, `update-${testRunId}`);
      const updatedSlug = `updated-${testRunId}`;

      const response = await request(app)
        .patch(`/api/categories/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "Updated Category",
          slug: updatedSlug,
          description: "Updated description",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createResponse.body.data.id,
        name: "Updated Category",
        slug: updatedSlug,
        description: "Updated description",
      });
    });

    it("returns validation errors for invalid updates", async () => {
      const createResponse = await createCategory(accessToken, `invalid-update-${testRunId}`);

      const response = await request(app)
        .patch(`/api/categories/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("returns not found for missing categories", async () => {
      const response = await request(app)
        .patch("/api/categories/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Missing Category" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("deletes a category", async () => {
      const createResponse = await createCategory(accessToken, `delete-${testRunId}`);

      const deleteResponse = await request(app)
        .delete(`/api/categories/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      const getResponse = await request(app)
        .get(`/api/categories/${createResponse.body.data.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(204);
      expect(getResponse.status).toBe(404);
    });

    it("returns not found for missing categories", async () => {
      const response = await request(app)
        .delete("/api/categories/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Authorization", () => {
    it("returns forbidden when the user lacks category permissions", async () => {
      const response = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${forbiddenAccessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
