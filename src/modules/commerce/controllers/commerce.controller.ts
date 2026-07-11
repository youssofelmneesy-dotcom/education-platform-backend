import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ICommerceService } from "../interfaces/index.js";
import { CommerceService } from "../services/index.js";

export class CommerceController {
  constructor(private readonly service: ICommerceService = new CommerceService()) {}
  createOrder = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 201, "Order created successfully", await this.service.createOrder(tenantId, userId, req.body)); };
  listOrders = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Orders retrieved successfully", await this.service.listOrders(tenantId, req.query as any)); };
  getOrder = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Order retrieved successfully", await this.service.getOrder(this.param(req, "id"), tenantId)); };
  updateOrder = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Order updated successfully", await this.service.updateOrder(this.param(req, "id"), tenantId, req.body)); };
  deleteOrder = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.service.deleteOrder(this.param(req, "id"), tenantId); res.status(204).send(); };
  createPayment = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Payment created successfully", await this.service.createPayment(tenantId, req.body)); };
  updatePayment = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Payment updated successfully", await this.service.updatePayment(this.param(req, "id"), tenantId, req.body)); };
  listPayments = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Payments retrieved successfully", await this.service.listPayments(tenantId, req.query as any)); };
  createCoupon = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Coupon created successfully", await this.service.createCoupon(tenantId, req.body)); };
  updateCoupon = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Coupon updated successfully", await this.service.updateCoupon(this.param(req, "id"), tenantId, req.body)); };
  listCoupons = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Coupons retrieved successfully", await this.service.listCoupons(tenantId, req.query as any)); };
  deleteCoupon = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.service.deleteCoupon(this.param(req, "id"), tenantId); res.status(204).send(); };
  createGiftCard = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Gift card created successfully", await this.service.createGiftCard(tenantId, req.body)); };
  redeemGiftCard = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Gift card redeemed successfully", await this.service.redeemGiftCard(tenantId, userId, req.body)); };
  listGiftCards = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Gift cards retrieved successfully", await this.service.listGiftCards(tenantId, req.query as any)); };
  createSubscription = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Subscription created successfully", await this.service.createSubscription(tenantId, req.body)); };
  cancelSubscription = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Subscription cancelled successfully", await this.service.cancelSubscription(this.param(req, "id"), tenantId)); };
  listSubscriptions = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Subscriptions retrieved successfully", await this.service.listSubscriptions(tenantId, req.query as any)); };
  createInvoice = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Invoice created successfully", await this.service.createInvoice(tenantId, req.body)); };
  listInvoices = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Invoices retrieved successfully", await this.service.listInvoices(tenantId, req.query as any)); };
  createRefund = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 201, "Refund created successfully", await this.service.createRefund(tenantId, userId, req.body)); };
  listRefunds = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Refunds retrieved successfully", await this.service.listRefunds(tenantId, req.query as any)); };
  getStatistics = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Commerce statistics retrieved successfully", await this.service.getStatistics(tenantId)); };
  private auth(req: Request): { userId: string; tenantId: string } { if (!req.user) throw new UnauthorizedError(); return { userId: req.user.sub, tenantId: req.user.tenantId }; }
  private param(req: Request, name: string): string { const value = req.params[name]; return Array.isArray(value) ? value[0] : value; }
}
