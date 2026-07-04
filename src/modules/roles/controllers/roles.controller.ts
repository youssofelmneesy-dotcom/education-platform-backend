import type { Request, Response } from "express";
import type { IRolesController, IRolesService } from "../interfaces/index.js";
import { RolesService } from "../services/index.js";
import { createRoleSchema, updateRoleSchema } from "../validators/index.js";
import { DuplicateRoleNameError, RoleNotFoundError } from "../utils/index.js";

export class RolesController implements IRolesController {
  constructor(private readonly rolesService: IRolesService = new RolesService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createRoleSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const data = await this.rolesService.create(req.user.tenantId, validationResult.data);

      res.status(201).json({ success: true, message: "Role created successfully", data });
    } catch (error) {
      if (error instanceof DuplicateRoleNameError) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    try {
      const data = await this.rolesService.list(req.user.tenantId, page, limit);

      res.status(200).json({ success: true, message: "Roles retrieved successfully", data });
    } catch {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
      const data = await this.rolesService.getById(id, req.user.tenantId);

      res.status(200).json({ success: true, message: "Role retrieved successfully", data });
    } catch (error) {
      if (error instanceof RoleNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateRoleSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
      const data = await this.rolesService.updateById(id, req.user.tenantId, validationResult.data);

      res.status(200).json({ success: true, message: "Role updated successfully", data });
    } catch (error) {
      if (error instanceof RoleNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      if (error instanceof DuplicateRoleNameError) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
      await this.rolesService.deleteById(id, req.user.tenantId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof RoleNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
