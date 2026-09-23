import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { prisma } from "../../../src/database/index.js";
import { getAuthToken } from "../helpers/auth.js";
import { findUserByEmail } from "../helpers/db.js";

const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorizedEmail = `commerce-${testRunId}@example.com`;
const forbiddenEmail = `commerce-forbidden-${testRunId}@example.com`;
const password = "SecurePass123!";
const tenantId = process.env.TENANT_ID ?? "00000000-0000-0000-0000-000000000000";
const permissions = [
  "commerce:read",
  "orders:list",
  "orders:read",
  "orders:update",
  "orders:delete",
  "payments:list",
  "payments:create",
  "payments:update",
  "coupons:list",
  "coupons:create",
  "coupons:update",
  "coupons:delete",
  "gift-cards:list",
  "gift-cards:create",
  "subscriptions:list",
  "subscriptions:create",
  "subscriptions:update",
  "invoices:list",
  "invoices:create",
  "refunds:list",
  "refunds:create",
];

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

async function grantCommercePermissions(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User not found for ${email}`);
  }

  const role = await prisma.role.create({
    data: { tenantId, name: `commerce-tester-${testRunId}`, description: "Commerce integration test role" },
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

async function createOrder(token: string, title = "Commerce Course") {
  return request(app)
    .post("/api/commerce/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      currency: "USD",
      tax: 10,
      items: [{ itemType: "course", title, quantity: 1, unitPrice: 100 }],
    });
}

describe("Commerce API", () => {
  let accessToken: string;
  let forbiddenAccessToken: string;
  let userId: string;

  beforeAll(async () => {
    await ensureDefaultTenant();
    await registerTestUser("Commerce", "Tester", authorizedEmail);
    await registerTestUser("Commerce", "Forbidden", forbiddenEmail);
    await grantCommercePermissions(authorizedEmail);
    const user = await findUserByEmail(authorizedEmail);
    const authorized = await getAuthToken(authorizedEmail, password);
    const forbidden = await getAuthToken(forbiddenEmail, password);

    if (!user) {
      throw new Error("Authorized test user not found");
    }

    userId = user.id;
    accessToken = authorized.accessToken;
    forbiddenAccessToken = forbidden.accessToken;
  });

  it("creates, lists, reads, updates, deletes orders and reports statistics", async () => {
    const created = await createOrder(accessToken, `Order Item ${testRunId}`);
    const list = await request(app).get("/api/commerce/orders").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const read = await request(app).get(`/api/commerce/orders/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app).patch(`/api/commerce/orders/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ status: "paid" });
    const deleted = await request(app).delete(`/api/commerce/orders/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const statistics = await request(app).get("/api/commerce/statistics").set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ userId, status: "pending", currency: "USD", subtotal: 100, tax: 10, total: 110 });
    expect(list.status).toBe(200);
    expect(read.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("paid");
    expect(deleted.status).toBe(204);
    expect(statistics.status).toBe(200);
    expect(statistics.body.data.totalOrders).toBeGreaterThanOrEqual(0);
  });

  it("rejects validation failures, unauthorized requests, forbidden requests, and missing orders", async () => {
    const invalid = await request(app).post("/api/commerce/orders").set("Authorization", `Bearer ${accessToken}`).send({ currency: "US", items: [] });
    const unauthorized = await request(app).get("/api/commerce/orders");
    const forbidden = await request(app).get("/api/commerce/orders").set("Authorization", `Bearer ${forbiddenAccessToken}`);
    const missing = await request(app).get("/api/commerce/orders/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

    expect(invalid.status).toBe(400);
    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(missing.status).toBe(404);
  });

  it("creates, lists, and updates payments", async () => {
    const order = await createOrder(accessToken, `Payment Order ${testRunId}`);
    const created = await request(app)
      .post("/api/commerce/payments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ orderId: order.body.data.id, provider: "stripe", providerTransactionId: `txn-${testRunId}`, status: "paid", currency: "USD", amount: 110 });
    const list = await request(app).get("/api/commerce/payments").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app).patch(`/api/commerce/payments/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ status: "refunded" });
    const missing = await request(app).patch("/api/commerce/payments/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`).send({ status: "paid" });

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ orderId: order.body.data.id, status: "paid", amount: 110 });
    expect(list.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("refunded");
    expect(missing.status).toBe(404);
  });

  it("creates, lists, updates, and deletes coupons", async () => {
    const code = `SAVE-${testRunId}`;
    const created = await request(app).post("/api/commerce/coupons").set("Authorization", `Bearer ${accessToken}`).send({ code, discountType: "percent", discountValue: 10 });
    const list = await request(app).get("/api/commerce/coupons").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const updated = await request(app).patch(`/api/commerce/coupons/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`).send({ isActive: false });
    const deleted = await request(app).delete(`/api/commerce/coupons/${created.body.data.id}`).set("Authorization", `Bearer ${accessToken}`);
    const missing = await request(app).delete("/api/commerce/coupons/11111111-1111-4111-8111-111111111111").set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ code, discountType: "percent", discountValue: 10 });
    expect(list.status).toBe(200);
    expect(updated.status).toBe(200);
    expect(updated.body.data.isActive).toBe(false);
    expect(deleted.status).toBe(204);
    expect(missing.status).toBe(404);
  });

  it("creates, lists, and redeems gift cards", async () => {
    const code = `GIFT-${testRunId}`;
    const created = await request(app).post("/api/commerce/gift-cards").set("Authorization", `Bearer ${accessToken}`).send({ code, currency: "USD", initialBalance: 100 });
    const list = await request(app).get("/api/commerce/gift-cards").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const redeemed = await request(app).post("/api/commerce/gift-cards/redeem").set("Authorization", `Bearer ${accessToken}`).send({ code, amount: 25 });
    const invalid = await request(app).post("/api/commerce/gift-cards/redeem").set("Authorization", `Bearer ${accessToken}`).send({ code: "missing-card" });

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ currency: "USD", initialBalance: 100, currentBalance: 100 });
    expect(list.status).toBe(200);
    expect(redeemed.status).toBe(200);
    expect(redeemed.body.data).toMatchObject({ redeemedById: userId, currentBalance: 75 });
    expect(invalid.status).toBe(422);
  });

  it("creates, lists, and cancels subscriptions", async () => {
    const created = await request(app).post("/api/commerce/subscriptions").set("Authorization", `Bearer ${accessToken}`).send({ userId, provider: "stripe", providerSubscriptionId: `sub-${testRunId}`, status: "active" });
    const list = await request(app).get("/api/commerce/subscriptions").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);
    const cancelled = await request(app).post(`/api/commerce/subscriptions/${created.body.data.id}/cancel`).set("Authorization", `Bearer ${accessToken}`);
    const missing = await request(app).post("/api/commerce/subscriptions/11111111-1111-4111-8111-111111111111/cancel").set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ userId, status: "active" });
    expect(list.status).toBe(200);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");
    expect(missing.status).toBe(404);
  });

  it("creates and lists invoices", async () => {
    const order = await createOrder(accessToken, `Invoice Order ${testRunId}`);
    const created = await request(app)
      .post("/api/commerce/invoices")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, orderId: order.body.data.id, status: "open", currency: "USD", subtotal: 100, tax: 10, total: 110 });
    const list = await request(app).get("/api/commerce/invoices").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ userId, orderId: order.body.data.id, status: "open", total: 110 });
    expect(list.status).toBe(200);
  });

  it("creates and lists refunds", async () => {
    const order = await createOrder(accessToken, `Refund Order ${testRunId}`);
    const payment = await request(app)
      .post("/api/commerce/payments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ orderId: order.body.data.id, provider: "stripe", providerTransactionId: `refund-payment-${testRunId}`, status: "paid", currency: "USD", amount: 110 });
    const created = await request(app)
      .post("/api/commerce/refunds")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ orderId: order.body.data.id, paymentId: payment.body.data.id, providerRefundId: `refund-${testRunId}`, status: "succeeded", reason: "requested", currency: "USD", amount: 50 });
    const list = await request(app).get("/api/commerce/refunds").query({ page: 1, limit: 10 }).set("Authorization", `Bearer ${accessToken}`);

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ orderId: order.body.data.id, paymentId: payment.body.data.id, status: "succeeded", amount: 50 });
    expect(list.status).toBe(200);
  });
});
