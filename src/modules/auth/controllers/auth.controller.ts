import type { Request, Response } from "express";

import { sendSuccess } from "../../../shared/utils/index.js";
import type { IAuthController, IAuthService } from "../interfaces/index.js";
import { AuthService } from "../services/index.js";

export class AuthController implements IAuthController {
  constructor(private readonly authService: IAuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.register(req.body);
    sendSuccess(res, 201, "User registered successfully", user);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const data = await this.authService.login(req.body);
    sendSuccess(res, 200, "User logged in successfully", data);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const data = await this.authService.refresh(req.body);
    sendSuccess(res, 200, "Token refreshed successfully", data);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logout(req.body);
    res.status(204).send();
  };
}
