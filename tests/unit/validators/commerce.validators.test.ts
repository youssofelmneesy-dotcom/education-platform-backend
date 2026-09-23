import { describe, expect, it } from "vitest";

import {
  couponSchema,
  createGiftCardSchema,
  createInvoiceSchema,
  createOrderSchema,
  createPaymentSchema,
  createRefundSchema,
  createSubscriptionSchema,
  idParamsSchema,
  paginationQuerySchema,
  redeemGiftCardSchema,
  updateCouponSchema,
  updateOrderSchema,
  updatePaymentSchema,
} from "../../../src/modules/commerce/validators/index.js";

const uuid = "11111111-1111-4111-8111-111111111111";
const iso = new Date("2026-01-01T00:00:00.000Z").toISOString();

describe("commerce validators", () => {
  it("validates id params and pagination queries", () => {
    expect(idParamsSchema.safeParse({ id: uuid }).success).toBe(true);
    expect(idParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);

    const query = paginationQuerySchema.parse({ page: "2", limit: "25", status: "paid", userId: uuid, sortOrder: "asc" });
    expect(query).toMatchObject({ page: 2, limit: 25, status: "paid", userId: uuid, sortOrder: "asc" });
    expect(paginationQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("validates order payloads", () => {
    expect(
      createOrderSchema.safeParse({
        currency: "USD",
        tax: 10,
        items: [{ courseId: uuid, itemType: "course", title: "Course", quantity: 1, unitPrice: 100 }],
      }).success
    ).toBe(true);
    expect(createOrderSchema.safeParse({ currency: "US", items: [] }).success).toBe(false);
    expect(updateOrderSchema.safeParse({ status: "paid", tax: 0 }).success).toBe(true);
    expect(updateOrderSchema.safeParse({ tax: -1 }).success).toBe(false);
  });

  it("validates payment payloads", () => {
    expect(createPaymentSchema.safeParse({ orderId: uuid, provider: "stripe", status: "paid", currency: "USD", amount: 100, paidAt: iso }).success).toBe(true);
    expect(createPaymentSchema.safeParse({ orderId: uuid, provider: "", currency: "USD", amount: -1 }).success).toBe(false);
    expect(updatePaymentSchema.safeParse({ status: "paid", providerTransactionId: "txn", paidAt: iso }).success).toBe(true);
    expect(updatePaymentSchema.safeParse({ paidAt: "bad-date" }).success).toBe(false);
  });

  it("validates coupon payloads", () => {
    expect(couponSchema.safeParse({ code: "SAVE10", discountType: "percent", discountValue: 10, startsAt: iso, expiresAt: iso }).success).toBe(true);
    expect(couponSchema.safeParse({ code: "", discountType: "", discountValue: -1 }).success).toBe(false);
    expect(updateCouponSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it("validates gift card payloads", () => {
    expect(createGiftCardSchema.safeParse({ code: "GIFT", purchaserId: uuid, currency: "USD", initialBalance: 100, expiresAt: iso }).success).toBe(true);
    expect(createGiftCardSchema.safeParse({ code: "", currency: "US", initialBalance: -1 }).success).toBe(false);
    expect(redeemGiftCardSchema.safeParse({ code: "GIFT", amount: 10 }).success).toBe(true);
    expect(redeemGiftCardSchema.safeParse({ code: "GIFT", amount: 0 }).success).toBe(false);
  });

  it("validates subscription, invoice, and refund payloads", () => {
    expect(createSubscriptionSchema.safeParse({ userId: uuid, courseId: uuid, provider: "stripe", startsAt: iso }).success).toBe(true);
    expect(createSubscriptionSchema.safeParse({ userId: "bad-id" }).success).toBe(false);
    expect(createInvoiceSchema.safeParse({ userId: uuid, orderId: uuid, status: "open", currency: "USD", subtotal: 100, tax: 10, total: 110 }).success).toBe(true);
    expect(createInvoiceSchema.safeParse({ userId: uuid, currency: "US", subtotal: -1, total: 0 }).success).toBe(false);
    expect(createRefundSchema.safeParse({ orderId: uuid, paymentId: uuid, status: "succeeded", currency: "USD", amount: 50, refundedAt: iso }).success).toBe(true);
    expect(createRefundSchema.safeParse({ orderId: uuid, currency: "USD", amount: -1 }).success).toBe(false);
  });
});
