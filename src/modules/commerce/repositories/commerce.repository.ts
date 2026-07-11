import { prisma } from "../../../database/index.js";
import type { CreateCouponDto, CreateGiftCardDto, CreateInvoiceDto, CreateOrderDto, CreatePaymentDto, CreateRefundDto, CreateSubscriptionDto, PaginationQueryDto, RedeemGiftCardDto, UpdateCouponDto, UpdateOrderDto, UpdatePaymentDto } from "../dto/index.js";
import type { ICommerceRepository } from "../interfaces/index.js";

const orderInclude = { items: { where: { deletedAt: null } }, couponUsages: { where: { deletedAt: null }, include: { coupon: true } }, payments: { where: { deletedAt: null } } };

export class CommerceRepository implements ICommerceRepository {
  async createOrder(tenantId: string, userId: string, data: CreateOrderDto, orderNumber: string) {
    const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * (item.quantity ?? 1), 0);
    const coupon = data.couponCode ? await prisma.coupon.findFirst({ where: { tenantId, code: data.couponCode, isActive: true, deletedAt: null } }) : null;
    const now = new Date();
    let discount = 0;
    if (coupon && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.expiresAt || coupon.expiresAt >= now)) {
      discount = coupon.discountType === "percent" ? Math.floor((subtotal * coupon.discountValue) / 100) : coupon.discountValue;
      discount = Math.min(discount, subtotal);
    }
    const tax = data.tax ?? 0;
    const total = Math.max(subtotal - discount + tax, 0);
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { tenantId, userId, orderNumber, status: "pending", currency: data.currency, subtotal, discount, tax, total, items: { create: data.items.map((item) => ({ tenantId, ...item, quantity: item.quantity ?? 1, total: item.unitPrice * (item.quantity ?? 1) })) } },
        include: orderInclude,
      });
      if (coupon && discount > 0) await tx.couponUsage.create({ data: { tenantId, couponId: coupon.id, orderId: order.id, userId, discountAmount: discount } });
      return tx.order.findUnique({ where: { tenantId_id: { tenantId, id: order.id } }, include: orderInclude });
    });
  }

  async listOrders(tenantId: string, query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = { tenantId, deletedAt: null, ...(query.status ? { status: query.status } : {}), ...(query.userId ? { userId: query.userId } : {}), ...(query.search ? { orderNumber: { contains: query.search, mode: "insensitive" as const } } : {}) };
    const [orders, total] = await Promise.all([prisma.order.findMany({ where, include: orderInclude, orderBy: { [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc" }, skip, take: query.limit }), prisma.order.count({ where })]);
    return { orders, total };
  }
  async findOrderById(id: string, tenantId: string) { return prisma.order.findFirst({ where: { id, tenantId, deletedAt: null }, include: orderInclude }); }
  async updateOrder(id: string, tenantId: string, data: UpdateOrderDto) { const order = await this.findOrderById(id, tenantId); if (!order) return null; return prisma.order.update({ where: { tenantId_id: { tenantId, id } }, data, include: orderInclude }); }
  async deleteOrder(id: string, tenantId: string) { const r = await prisma.order.updateMany({ where: { id, tenantId, deletedAt: null }, data: { deletedAt: new Date() } }); return r.count > 0; }

  async createPayment(tenantId: string, data: CreatePaymentDto) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({ data: { tenantId, ...data, paidAt: data.paidAt ? new Date(data.paidAt) : data.paidAt } });
      if (payment.status === "paid") await tx.order.updateMany({ where: { id: data.orderId, tenantId }, data: { status: "paid" } });
      return payment;
    });
  }
  async updatePayment(id: string, tenantId: string, data: UpdatePaymentDto) { const p = await prisma.payment.findFirst({ where: { id, tenantId, deletedAt: null } }); if (!p) return null; return prisma.payment.update({ where: { tenantId_id: { tenantId, id } }, data: { ...data, paidAt: data.paidAt ? new Date(data.paidAt) : data.paidAt } }); }
  async listPayments(tenantId: string, query: PaginationQueryDto) { const result = await this.list(prisma.payment, tenantId, query, "provider"); return { payments: result.items, total: result.total }; }

  async createCoupon(tenantId: string, data: CreateCouponDto) { return prisma.coupon.create({ data: { tenantId, ...data, startsAt: data.startsAt ? new Date(data.startsAt) : data.startsAt, expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt } }); }
  async updateCoupon(id: string, tenantId: string, data: UpdateCouponDto) { const c = await prisma.coupon.findFirst({ where: { id, tenantId, deletedAt: null } }); if (!c) return null; return prisma.coupon.update({ where: { tenantId_id: { tenantId, id } }, data: { ...data, startsAt: data.startsAt ? new Date(data.startsAt) : data.startsAt, expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt } }); }
  async listCoupons(tenantId: string, query: PaginationQueryDto) { const result = await this.list(prisma.coupon, tenantId, query, "code"); return { coupons: result.items, total: result.total }; }
  async deleteCoupon(id: string, tenantId: string) { const r = await prisma.coupon.updateMany({ where: { id, tenantId, deletedAt: null }, data: { deletedAt: new Date(), isActive: false } }); return r.count > 0; }

  async createGiftCard(tenantId: string, codeHash: string, data: CreateGiftCardDto) { return prisma.giftCard.create({ data: { tenantId, codeHash, purchaserId: data.purchaserId, currency: data.currency, initialBalance: data.initialBalance, currentBalance: data.initialBalance, expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt } }); }
  async redeemGiftCard(tenantId: string, userId: string, codeHash: string, data: RedeemGiftCardDto) {
    const card = await prisma.giftCard.findFirst({ where: { codeHash, tenantId, deletedAt: null } });
    if (!card || card.currentBalance <= 0 || (card.expiresAt && card.expiresAt < new Date())) return null;
    const amount = Math.min(data.amount ?? card.currentBalance, card.currentBalance);
    return prisma.giftCard.update({ where: { id: card.id }, data: { currentBalance: card.currentBalance - amount, redeemedById: userId, redeemedAt: new Date() } });
  }
  async listGiftCards(tenantId: string, query: PaginationQueryDto) { const result = await this.list(prisma.giftCard, tenantId, query); return { giftCards: result.items, total: result.total }; }

  async createSubscription(tenantId: string, data: CreateSubscriptionDto) { return prisma.subscription.create({ data: { tenantId, ...data, startsAt: data.startsAt ? new Date(data.startsAt) : undefined, currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : data.currentPeriodStart, currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : data.currentPeriodEnd } }); }
  async cancelSubscription(id: string, tenantId: string) { const s = await prisma.subscription.findFirst({ where: { id, tenantId, deletedAt: null } }); if (!s) return null; return prisma.subscription.update({ where: { tenantId_id: { tenantId, id } }, data: { status: "cancelled", canceledAt: new Date() } }); }
  async listSubscriptions(tenantId: string, query: PaginationQueryDto) { const result = await this.list(prisma.subscription, tenantId, query, "provider"); return { subscriptions: result.items, total: result.total }; }

  async createInvoice(tenantId: string, invoiceNumber: string, data: CreateInvoiceDto) { return prisma.invoice.create({ data: { tenantId, invoiceNumber, ...data, dueAt: data.dueAt ? new Date(data.dueAt) : data.dueAt, paidAt: data.paidAt ? new Date(data.paidAt) : data.paidAt } }); }
  async listInvoices(tenantId: string, query: PaginationQueryDto) { const result = await this.list(prisma.invoice, tenantId, query, "invoiceNumber"); return { invoices: result.items, total: result.total }; }

  async createRefund(tenantId: string, userId: string, data: CreateRefundDto) {
    return prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({ data: { tenantId, userId, ...data, refundedAt: data.refundedAt ? new Date(data.refundedAt) : data.refundedAt } });
      if (refund.status === "succeeded") await tx.order.updateMany({ where: { id: data.orderId, tenantId }, data: { status: "refunded" } });
      return refund;
    });
  }
  async listRefunds(tenantId: string, query: PaginationQueryDto) { const result = await this.list(prisma.refund, tenantId, query, "reason"); return { refunds: result.items, total: result.total }; }

  async getStatistics(tenantId: string) {
    const [orders, orderGroups, paid, payments, paymentGroups, coupons, giftCards, subs, subGroups, invoices, refunds, refundAgg] = await Promise.all([
      prisma.order.count({ where: { tenantId, deletedAt: null } }),
      prisma.order.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { tenantId, deletedAt: null, status: "paid" }, _sum: { amount: true } }),
      prisma.payment.count({ where: { tenantId, deletedAt: null } }),
      prisma.payment.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.coupon.count({ where: { tenantId, deletedAt: null } }),
      prisma.giftCard.count({ where: { tenantId, deletedAt: null } }),
      prisma.subscription.count({ where: { tenantId, deletedAt: null } }),
      prisma.subscription.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.invoice.count({ where: { tenantId, deletedAt: null } }),
      prisma.refund.count({ where: { tenantId, deletedAt: null } }),
      prisma.refund.aggregate({ where: { tenantId, deletedAt: null, status: "succeeded" }, _sum: { amount: true } }),
    ]);
    return { totalOrders: orders, ordersByStatus: orderGroups.map((g) => ({ status: g.status, count: g._count.id })), totalRevenue: paid._sum.amount ?? 0, totalPayments: payments, paymentsByStatus: paymentGroups.map((g) => ({ status: g.status, count: g._count.id })), totalCoupons: coupons, totalGiftCards: giftCards, totalSubscriptions: subs, subscriptionsByStatus: subGroups.map((g) => ({ status: g.status, count: g._count.id })), totalInvoices: invoices, totalRefunds: refunds, refundedAmount: refundAgg._sum.amount ?? 0 };
  }

  private async list(model: any, tenantId: string, query: PaginationQueryDto, searchField?: string): Promise<{ items: any[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where = { tenantId, deletedAt: null, ...(query.status ? { status: query.status } : {}), ...(query.userId ? { userId: query.userId } : {}), ...(query.search && searchField ? { [searchField]: { contains: query.search, mode: "insensitive" } } : {}) };
    const [items, total] = await Promise.all([model.findMany({ where, orderBy: { [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc" }, skip, take: query.limit }), model.count({ where })]);
    return { items, total };
  }
}
