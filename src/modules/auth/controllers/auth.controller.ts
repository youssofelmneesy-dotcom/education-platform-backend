import type { Request, Response } from "express";

import type { IAuthController, IAuthService } from "../interfaces/index.js";
import { AuthService } from "../services/index.js";
import { AuthError } from "../utils/index.js";
import { loginRequestSchema, refreshRequestSchema, registerRequestSchema, logoutRequestSchema } from "../validators/index.js";

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

  login = async (req: Request, res: Response): Promise<void> => {
    const validationResult = loginRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const data = await this.authService.login(validationResult.data);

      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data,
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

  refresh = async (req: Request, res: Response): Promise<void> => {
    const validationResult = refreshRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const data = await this.authService.refresh(validationResult.data);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data,
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

  logout = async (req: Request, res: Response): Promise<void> => {
    const validationResult = logoutRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      await this.authService.logout(validationResult.data);
      res.status(204).send();
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
