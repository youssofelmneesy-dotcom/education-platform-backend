import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { IProfilesController, IProfilesService } from "../interfaces/index.js";
import { ProfilesService } from "../services/index.js";

export class ProfilesController implements IProfilesController {
  constructor(private readonly profilesService: IProfilesService = new ProfilesService()) {}

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.profilesService.getMyProfile(req.user.sub, req.user.tenantId);
    sendSuccess(res, 200, "Profile retrieved successfully", data);
  };

  updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.profilesService.updateMyProfile(req.user.sub, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Profile updated successfully", data);
  };
}
