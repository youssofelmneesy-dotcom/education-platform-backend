import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommerceService } from "../../../src/modules/commerce/services/index.js";
import type { ICommerceRepository } from "../../../src/modules/commerce/interfaces/index.js";
import { CommerceNotFoundError, InvalidGiftCardError } from "../../../src/modules/commerce/utils/index.js";

const tenantId = "tenant-id";
const userId = "user-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function orderRecord(overrides: Record<string, unknown> = {}) {
  return { id: "order-id", userId, orderNumber: "ORD-1", status: "pending", currency: "USD", subtotal: 100, discount: 0, tax: 10, total: 110, items: [], createdAt: now, updatedAt: now, ...overrides };
}

function paymentRecord(overrides: Record<string, unknown> = {}) {
  return { id: "payment-id", orderId: "order-id", provider: "stripe", status: "paid", currency: "USD", amount: 110, createdAt: now, updatedAt: now, ...overrides };
}

function couponRecord(overrides: Record<string, unknown> = {}) {
  return { id: "coupon-id", code: "SAVE10", description: null, discountType: "percent", discountValue: 10, maxRedemptions: null, perUserLimit: null, startsAt: null, expiresAt: null, isActive: true, createdAt: now, updatedAt: now, ...overrides };
}

function giftCardRecord(overrides: Record<string, unknown> = {}) {
  return { id: "gift-card-id", purchaserId: null, redeemedById: null, currency: "USD", initialBalance: 100, currentBalance: 100, expiresAt: null, redeemedAt: null, createdAt: now, updatedAt: now, ...overrides };
}

function subscriptionRecord(overrides: Record<string, unknown> = {}) {
  return { id: "subscription-id", userId, courseId: null, bundleId: null, provider: "stripe", providerSubscriptionId: "sub_1", status: "active", startsAt: now, currentPeriodStart: null, currentPeriodEnd: null, canceledAt: null, createdAt: now, updatedAt: now, ...overrides };
}

function invoiceRecord(overrides: Record<string, unknown> = {}) {
  return { id: "invoice-id", userId, orderId: "order-id", subscriptionId: null, invoiceNumber: "INV-1", status: "open", currency: "USD", subtotal: 100, tax: 10, total: 110, dueAt: null, paidAt: null, createdAt: now, updatedAt: now, ...overrides };
}

function refundRecord(overrides: Record<string, unknown> = {}) {
  return { id: "refund-id", orderId: "order-id", paymentId: "payment-id", userId, providerRefundId: null, status: "succeeded", reason: null, currency: "USD", amount: 50, refundedAt: null, createdAt: now, updatedAt: now, ...overrides };
}

function createRepositoryMock(): ICommerceRepository {
  return {
    createOrder: vi.fn().mockResolvedValue(orderRecord()),
    listOrders: vi.fn().mockResolvedValue({ orders: [orderRecord()], total: 1 }),
    findOrderById: vi.fn().mockResolvedValue(orderRecord()),
    updateOrder: vi.fn().mockResolvedValue(orderRecord({ status: "paid" })),
    deleteOrder: vi.fn().mockResolvedValue(true),
    createPayment: vi.fn().mockResolvedValue(paymentRecord()),
    updatePayment: vi.fn().mockResolvedValue(paymentRecord({ status: "refunded" })),
    listPayments: vi.fn().mockResolvedValue({ payments: [paymentRecord()], total: 1 }),
    createCoupon: vi.fn().mockResolvedValue(couponRecord()),
    updateCoupon: vi.fn().mockResolvedValue(couponRecord({ isActive: false })),
    listCoupons: vi.fn().mockResolvedValue({ coupons: [couponRecord()], total: 1 }),
    deleteCoupon: vi.fn().mockResolvedValue(true),
    createGiftCard: vi.fn().mockResolvedValue(giftCardRecord()),
    redeemGiftCard: vi.fn().mockResolvedValue(giftCardRecord({ redeemedById: userId, currentBalance: 50, redeemedAt: now })),
    listGiftCards: vi.fn().mockResolvedValue({ giftCards: [giftCardRecord()], total: 1 }),
    createSubscription: vi.fn().mockResolvedValue(subscriptionRecord()),
    cancelSubscription: vi.fn().mockResolvedValue(subscriptionRecord({ status: "cancelled", canceledAt: now })),
    listSubscriptions: vi.fn().mockResolvedValue({ subscriptions: [subscriptionRecord()], total: 1 }),
    createInvoice: vi.fn().mockResolvedValue(invoiceRecord()),
    listInvoices: vi.fn().mockResolvedValue({ invoices: [invoiceRecord()], total: 1 }),
    createRefund: vi.fn().mockResolvedValue(refundRecord()),
    listRefunds: vi.fn().mockResolvedValue({ refunds: [refundRecord()], total: 1 }),
    getStatistics: vi.fn().mockResolvedValue({
      totalOrders: 1,
      ordersByStatus: [{ status: "paid", count: 1 }],
      totalRevenue: 110,
      totalPayments: 1,
      paymentsByStatus: [{ status: "paid", count: 1 }],
      totalCoupons: 1,
      totalGiftCards: 1,
      totalSubscriptions: 1,
      subscriptionsByStatus: [{ status: "active", count: 1 }],
      totalInvoices: 1,
      totalRefunds: 1,
      refundedAmount: 50,
    }),
  };
}

describe("CommerceService", () => {
  let repo: ICommerceRepository;
  let service: CommerceService;

  beforeEach(() => {
    repo = createRepositoryMock();
    service = new CommerceService(repo);
  });

  it("creates, lists, gets, updates, and deletes orders", async () => {
    await expect(service.createOrder(tenantId, userId, { currency: "USD", items: [{ itemType: "course", title: "Course", unitPrice: 100 }] })).resolves.toMatchObject({ id: "order-id" });
    expect(repo.createOrder).toHaveBeenCalledWith(tenantId, userId, expect.objectContaining({ currency: "USD" }), expect.stringMatching(/^ORD-/));
    await expect(service.listOrders(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1, page: 1, limit: 10 });
    await expect(service.getOrder("order-id", tenantId)).resolves.toMatchObject({ id: "order-id" });
    await expect(service.updateOrder("order-id", tenantId, { status: "paid" })).resolves.toMatchObject({ status: "paid" });
    await expect(service.deleteOrder("order-id", tenantId)).resolves.toBeUndefined();
  });

  it("throws not found errors for missing order operations", async () => {
    vi.mocked(repo.findOrderById).mockResolvedValue(null);
    vi.mocked(repo.updateOrder).mockResolvedValue(null);
    vi.mocked(repo.deleteOrder).mockResolvedValue(false);

    await expect(service.getOrder("missing", tenantId)).rejects.toBeInstanceOf(CommerceNotFoundError);
    await expect(service.updateOrder("missing", tenantId, {})).rejects.toBeInstanceOf(CommerceNotFoundError);
    await expect(service.deleteOrder("missing", tenantId)).rejects.toBeInstanceOf(CommerceNotFoundError);
  });

  it("creates, lists, and updates payments", async () => {
    await expect(service.createPayment(tenantId, { orderId: "order-id", provider: "stripe", currency: "USD", amount: 110 })).resolves.toMatchObject({ id: "payment-id" });
    await expect(service.listPayments(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1, page: 1, limit: 10 });
    await expect(service.updatePayment("payment-id", tenantId, { status: "refunded" })).resolves.toMatchObject({ status: "refunded" });

    vi.mocked(repo.updatePayment).mockResolvedValue(null);
    await expect(service.updatePayment("missing", tenantId, {})).rejects.toBeInstanceOf(CommerceNotFoundError);
  });

  it("creates, lists, updates, and deletes coupons", async () => {
    await expect(service.createCoupon(tenantId, { code: "SAVE10", discountType: "percent", discountValue: 10 })).resolves.toMatchObject({ code: "SAVE10" });
    await expect(service.listCoupons(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1 });
    await expect(service.updateCoupon("coupon-id", tenantId, { isActive: false })).resolves.toMatchObject({ isActive: false });
    await expect(service.deleteCoupon("coupon-id", tenantId)).resolves.toBeUndefined();

    vi.mocked(repo.updateCoupon).mockResolvedValue(null);
    vi.mocked(repo.deleteCoupon).mockResolvedValue(false);
    await expect(service.updateCoupon("missing", tenantId, {})).rejects.toBeInstanceOf(CommerceNotFoundError);
    await expect(service.deleteCoupon("missing", tenantId)).rejects.toBeInstanceOf(CommerceNotFoundError);
  });

  it("creates, redeems, and lists gift cards using hashed codes", async () => {
    const codeHash = createHash("sha256").update("GIFT").digest("hex");

    await expect(service.createGiftCard(tenantId, { code: "GIFT", currency: "USD", initialBalance: 100 })).resolves.toMatchObject({ id: "gift-card-id" });
    expect(repo.createGiftCard).toHaveBeenCalledWith(tenantId, codeHash, expect.objectContaining({ code: "GIFT" }));
    await expect(service.redeemGiftCard(tenantId, userId, { code: "GIFT", amount: 50 })).resolves.toMatchObject({ redeemedById: userId, currentBalance: 50 });
    expect(repo.redeemGiftCard).toHaveBeenCalledWith(tenantId, userId, codeHash, expect.objectContaining({ amount: 50 }));
    await expect(service.listGiftCards(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1 });
  });

  it("throws for invalid gift card redemption", async () => {
    vi.mocked(repo.redeemGiftCard).mockResolvedValue(null);

    await expect(service.redeemGiftCard(tenantId, userId, { code: "BAD" })).rejects.toBeInstanceOf(InvalidGiftCardError);
  });

  it("creates, lists, and cancels subscriptions", async () => {
    await expect(service.createSubscription(tenantId, { userId, provider: "stripe" })).resolves.toMatchObject({ id: "subscription-id" });
    await expect(service.listSubscriptions(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1 });
    await expect(service.cancelSubscription("subscription-id", tenantId)).resolves.toMatchObject({ status: "cancelled" });

    vi.mocked(repo.cancelSubscription).mockResolvedValue(null);
    await expect(service.cancelSubscription("missing", tenantId)).rejects.toBeInstanceOf(CommerceNotFoundError);
  });

  it("creates and lists invoices and refunds", async () => {
    await expect(service.createInvoice(tenantId, { userId, currency: "USD", subtotal: 100, total: 100 })).resolves.toMatchObject({ id: "invoice-id" });
    expect(repo.createInvoice).toHaveBeenCalledWith(tenantId, expect.stringMatching(/^INV-/), expect.objectContaining({ userId }));
    await expect(service.listInvoices(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1 });
    await expect(service.createRefund(tenantId, userId, { orderId: "order-id", currency: "USD", amount: 50 })).resolves.toMatchObject({ id: "refund-id" });
    await expect(service.listRefunds(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1 });
  });

  it("returns commerce statistics", async () => {
    await expect(service.getStatistics(tenantId)).resolves.toMatchObject({ totalOrders: 1, totalRevenue: 110, refundedAmount: 50 });
  });
});
