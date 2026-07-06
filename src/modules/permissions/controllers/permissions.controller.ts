import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { IPermissionsController, IPermissionsService } from "../interfaces/index.js";
import { PermissionsService } from "../services/index.js";

export class PermissionsController implements IPermissionsController {
  constructor(private readonly permissionsService: IPermissionsService = new PermissionsService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.permissionsService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Permission created successfully", data);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const data = await this.permissionsService.list(req.user.tenantId, page, limit);
    sendSuccess(res, 200, "Permissions retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.permissionsService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Permission retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.permissionsService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Permission updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.permissionsService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };
}
