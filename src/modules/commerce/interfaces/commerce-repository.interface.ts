import type { CreateCouponDto, CreateGiftCardDto, CreateInvoiceDto, CreateOrderDto, CreatePaymentDto, CreateRefundDto, CreateSubscriptionDto, PaginationQueryDto, RedeemGiftCardDto, UpdateCouponDto, UpdateOrderDto, UpdatePaymentDto } from "../dto/index.js";
export interface ICommerceRepository {
  createOrder(tenantId: string, userId: string, data: CreateOrderDto, orderNumber: string): Promise<any>;
  listOrders(tenantId: string, query: PaginationQueryDto): Promise<{ orders: any[]; total: number }>;
  findOrderById(id: string, tenantId: string): Promise<any | null>;
  updateOrder(id: string, tenantId: string, data: UpdateOrderDto): Promise<any | null>;
  deleteOrder(id: string, tenantId: string): Promise<boolean>;
  createPayment(tenantId: string, data: CreatePaymentDto): Promise<any>;
  updatePayment(id: string, tenantId: string, data: UpdatePaymentDto): Promise<any | null>;
  listPayments(tenantId: string, query: PaginationQueryDto): Promise<{ payments: any[]; total: number }>;
  createCoupon(tenantId: string, data: CreateCouponDto): Promise<any>;
  updateCoupon(id: string, tenantId: string, data: UpdateCouponDto): Promise<any | null>;
  listCoupons(tenantId: string, query: PaginationQueryDto): Promise<{ coupons: any[]; total: number }>;
  deleteCoupon(id: string, tenantId: string): Promise<boolean>;
  createGiftCard(tenantId: string, codeHash: string, data: CreateGiftCardDto): Promise<any>;
  redeemGiftCard(tenantId: string, userId: string, codeHash: string, data: RedeemGiftCardDto): Promise<any | null>;
  listGiftCards(tenantId: string, query: PaginationQueryDto): Promise<{ giftCards: any[]; total: number }>;
  createSubscription(tenantId: string, data: CreateSubscriptionDto): Promise<any>;
  cancelSubscription(id: string, tenantId: string): Promise<any | null>;
  listSubscriptions(tenantId: string, query: PaginationQueryDto): Promise<{ subscriptions: any[]; total: number }>;
  createInvoice(tenantId: string, invoiceNumber: string, data: CreateInvoiceDto): Promise<any>;
  listInvoices(tenantId: string, query: PaginationQueryDto): Promise<{ invoices: any[]; total: number }>;
  createRefund(tenantId: string, userId: string, data: CreateRefundDto): Promise<any>;
  listRefunds(tenantId: string, query: PaginationQueryDto): Promise<{ refunds: any[]; total: number }>;
  getStatistics(tenantId: string): Promise<any>;
}
