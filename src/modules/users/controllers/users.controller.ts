import type { Request, Response } from "express";
import type { IUsersController, IUsersService } from "../interfaces/index.js";
import { UsersService } from "../services/index.js";
import { ForbiddenError, NotFoundError } from "../utils/index.js";
import { updateUserSchema } from "../validators/index.js";

export class UsersController implements IUsersController {
  constructor(private readonly usersService: IUsersService = new UsersService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Only admin can list all users
    if (!req.userRoles?.includes("admin")) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

      const data = await this.usersService.listUsers(req.user.tenantId, page, limit);

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const isAdmin = req.userRoles?.includes("admin") ?? false;

    try {
      const data = await this.usersService.getUserById(id, req.user.tenantId, req.user.sub, isAdmin);

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const isAdmin = req.userRoles?.includes("admin") ?? false;

    try {
      const data = await this.usersService.updateUser(id, req.user.tenantId, req.user.sub, isAdmin, validationResult.data);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const isAdmin = req.userRoles?.includes("admin") ?? false;

    try {
      await this.usersService.deleteUser(id, req.user.tenantId, req.user.sub, isAdmin);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
