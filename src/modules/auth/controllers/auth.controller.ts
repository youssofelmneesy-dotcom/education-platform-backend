import type { Request, Response } from "express";

import type { IAuthController, IAuthService } from "../interfaces/index.js";
import { AuthService } from "../services/index.js";
import { AuthError } from "../utils/index.js";
import { registerRequestSchema } from "../validators/index.js";

export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const validationResult = registerRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const user = await this.authService.register(validationResult.data);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
