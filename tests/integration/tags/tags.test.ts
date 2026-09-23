import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `tags-${testRunId}@example.com`;
const forbiddenEmail = `tags-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const permissions = ["tags:create", "tags:list", "tags:read", "tags:update", "tags:delete"];

async function ensureDefaultTenant() {
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: { id: tenantId, name: "Test Tenant", slug: "test-tenant" },
  });
}

async function registerTestUser(firstName: string, lastName: string, email: string) {
  const response = await request(app).post("/api/auth/register").send({
    firstName,
    lastName,
    email,
    password,
    confirmPassword: password,
  });

  expect(response.status).toBe(201);
}

async function grantTagPermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) throw new Error(`User not found for ${email}`);

  const role = await prisma.role.create({
    data: { tenantId, name: `tags-tester-${testRunId}`, description: "Tags integration test role" },
  });

  await prisma.userRole.create({ data: { tenantId, userId: user.id, roleId: role.id } });

  await Promise.all(
    permissions.map(async (permissionName) => {
      const [resource, action] = permissionName.split(":");
      const permission = await prisma.permission.create({
        data: { tenantId, resource, action, description: `${permissionName} permission` },
      });

      await prisma.rolePermission.create({ data: { tenantId, roleId: role.id, permissionId: permission.id } });
    })
  );
}

describe("Tags API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Tags", "Tester", authorizedEmail);
    await registerTestUser("Tags", "Forbidden", forbiddenEmail);
    await grantTagPermissions(authorizedEmail);
    accessToken = (await getAuthToken(authorizedEmail, password)).accessToken;
    forbiddenAccessToken = (await getAuthToken(forbiddenEmail, password)).accessToken;
  });

  it("creates, lists, reads, updates, and deletes tags", async () => {
    const created = await request(app).post("/api/tags").set("Authorization", `Bearer ${accessToken}`).send({ name: `Tag ${testRunId}`, slug: `tag-${testRunId}` });
    const list = await request(app).get("/api/tags").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const read = await request(app).get(`/api/tags/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app).patch(`/api/tags/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ name: `Updated Tag ${testRunId}`, slug: `updated-tag-${testRunId}` });
    const deleted = await request(app).delete(`/api/tags/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ name: `Tag ${testRunId}`, slug: `tag-${testRunId}` });
    expect(list.status).toBe(200);
    expect(read.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ name: `Updated Tag ${testRunId}`, slug: `updated-tag-${testRunId}` });
    expect(deleted.status).toBe(204);
  });

  it("rejects validation failures, unauthorized requests, forbidden requests, duplicates, and missing tags", async () => {
    const duplicateSlug = `duplicate-tag-${testRunId}`;
    const first = await request(app).post("/api/tags").set("Authorization", `Bearer ${accessToken}`).send({ name: "Duplicate", slug: duplicateSlug });
    const duplicate = await request(app).post("/api/tags").set("Authorization", `Bearer ${accessToken}`).send({ name: "Duplicate Again", slug: duplicateSlug });
    const invalid = await request(app).post("/api/tags").set("Authorization", `Bearer ${accessToken}`).send({ name: "", slug: "bad" });
    const unauthorized = await request(app).get("/api/tags");
    const forbidden = await request(app).post("/api/tags").set("Authorization", `Bearer ${forbiddenAccessToken}`).send({ name: `Forbidden ${testRunId}`, slug: `forbidden-${testRunId}` });
    const missing = await request(app).get("/api/tags/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);
    expect(invalid.status).toBe(400);
    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(missing.status).toBe(404);
  });
});
