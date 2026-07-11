import { AppError } from "../../../shared/errors/index.js";
export class CommerceNotFoundError extends AppError { constructor(resource = "Commerce resource") { super(`${resource} not found`, 404, "COMMERCE_RESOURCE_NOT_FOUND"); } }
export class InvalidCouponError extends AppError { constructor() { super("Coupon is invalid or unavailable", 422, "INVALID_COUPON"); } }
export class InvalidGiftCardError extends AppError { constructor() { super("Gift card is invalid or has insufficient balance", 422, "INVALID_GIFT_CARD"); } }
export class RelatedCommerceResourceNotFoundError extends AppError { constructor() { super("Related commerce resource not found", 404, "RELATED_COMMERCE_RESOURCE_NOT_FOUND"); } }
