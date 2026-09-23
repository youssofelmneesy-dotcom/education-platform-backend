import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `permissions-${testRunId}@example.com`;
const forbiddenEmail = `permissions-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const routePermissions = ["permissions:create", "permissions:list", "permissions:read", "permissions:update", "permissions:delete"];

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

async function grantPermissionRouteAccess(email: string) {
  const user = await findUserByEmail(email);

  if (!user) throw new Error(`User not found for ${email}`);

  const role = await prisma.role.create({
    data: { tenantId, name: `permissions-tester-${testRunId}`, description: "Permissions integration test role" },
  });

  await prisma.userRole.create({ data: { tenantId, userId: user.id, roleId: role.id } });

  await Promise.all(
    routePermissions.map(async (permissionName) => {
      const [resource, action] = permissionName.split(":");
      const permission = await prisma.permission.create({
        data: { tenantId, resource, action, description: `${permissionName} permission` },
      });

      await prisma.rolePermission.create({ data: { tenantId, roleId: role.id, permissionId: permission.id } });
    })
  );
}

describe("Permissions API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Permissions", "Tester", authorizedEmail);
    await registerTestUser("Permissions", "Forbidden", forbiddenEmail);
    await grantPermissionRouteAccess(authorizedEmail);
    accessToken = (await getAuthToken(authorizedEmail, password)).accessToken;
    forbiddenAccessToken = (await getAuthToken(forbiddenEmail, password)).accessToken;
  });

  it("creates, lists, reads, updates, and deletes permissions", async () => {
    const created = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource: `resource-${testRunId}`, action: "read", description: "Can read resource" });
    const list = await request(app).get("/api/permissions").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const read = await request(app).get(`/api/permissions/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app).patch(`/api/permissions/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ action: "update", description: null });
    const deleted = await request(app).delete(`/api/permissions/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ resource: `resource-${testRunId}`, action: "read", description: "Can read resource" });
    expect(list.status).toBe(200);
    expect(read.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ action: "update", description: null });
    expect(deleted.status).toBe(204);
  });

  it("rejects validation failures, unauthorized requests, forbidden requests, duplicates, and missing permissions", async () => {
    const resource = `duplicate-resource-${testRunId}`;
    const first = await request(app).post("/api/permissions").set("Authorization", `Bearer ${accessToken}`).send({ resource, action: "read" });
    const duplicate = await request(app).post("/api/permissions").set("Authorization", `Bearer ${accessToken}`).send({ resource, action: "read" });
    const invalid = await request(app).post("/api/permissions").set("Authorization", `Bearer ${accessToken}`).send({ resource: "", action: "read" });
    const unauthorized = await request(app).get("/api/permissions");
    const forbidden = await request(app).post("/api/permissions").set("Authorization", `Bearer ${forbiddenAccessToken}`).send({ resource: `forbidden-${testRunId}`, action: "read" });
    const missing = await request(app).get("/api/permissions/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);
    expect(invalid.status).toBe(400);
    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(missing.status).toBe(404);
  });
});
