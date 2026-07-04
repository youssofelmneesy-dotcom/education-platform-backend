import type { Request, Response } from "express";
import type { IProfilesController, IProfilesService } from "../interfaces/index.js";
import { ProfilesService } from "../services/index.js";
import { updateProfileSchema } from "../validators/index.js";
import { ProfileNotFoundError } from "../utils/index.js";

export class ProfilesController implements IProfilesController {
  constructor(private readonly profilesService: IProfilesService = new ProfilesService()) {}

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const data = await this.profilesService.getMyProfile(req.user.sub, req.user.tenantId);

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data,
      });
    } catch (error) {
      if (error instanceof ProfileNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const validationResult = updateProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const data = await this.profilesService.updateMyProfile(req.user.sub, req.user.tenantId, validationResult.data);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data,
      });
    } catch (error) {
      if (error instanceof ProfileNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
