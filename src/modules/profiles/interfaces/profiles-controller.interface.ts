import type { Request, Response } from "express";

export interface IProfilesController {
  getMyProfile(req: Request, res: Response): Promise<void>;
  updateMyProfile(req: Request, res: Response): Promise<void>;
}
