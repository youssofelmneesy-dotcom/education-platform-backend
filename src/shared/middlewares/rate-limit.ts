import rateLimit from "express-rate-limit";

import { httpConfig } from "../config/index.js";
import { sendError } from "../utils/index.js";

export const globalRateLimiter = rateLimit({
  windowMs: httpConfig.rateLimit.windowMs,
  limit: httpConfig.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "Too many requests");
  },
});
