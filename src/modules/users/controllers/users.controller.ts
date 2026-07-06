import type { Request, Response } from "express";
import { ForbiddenAppError, UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { IUsersController, IUsersService } from "../interfaces/index.js";
import { UsersService } from "../services/index.js";

export class UsersController implements IUsersController {
  constructor(private readonly usersService: IUsersService = new UsersService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    // Only admin can list all users
    if (!req.userRoles?.includes("admin")) {
      throw new ForbiddenAppError();
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const data = await this.usersService.listUsers(req.user.tenantId, page, limit);
    sendSuccess(res, 200, "Users retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const isAdmin = req.userRoles?.includes("admin") ?? false;
    const data = await this.usersService.getUserById(id, req.user.tenantId, req.user.sub, isAdmin);
    sendSuccess(res, 200, "User retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const isAdmin = req.userRoles?.includes("admin") ?? false;
    const data = await this.usersService.updateUser(id, req.user.tenantId, req.user.sub, isAdmin, req.body);

    sendSuccess(res, 200, "User updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const isAdmin = req.userRoles?.includes("admin") ?? false;

    await this.usersService.deleteUser(id, req.user.tenantId, req.user.sub, isAdmin);
    res.status(204).send();
  };
}
