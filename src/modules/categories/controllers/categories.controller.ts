import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ICategoriesController, ICategoriesService } from "../interfaces/index.js";
import { CategoriesService } from "../services/index.js";

export class CategoriesController implements ICategoriesController {
  constructor(private readonly categoriesService: ICategoriesService = new CategoriesService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.categoriesService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Category created successfully", data);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const data = await this.categoriesService.list(req.user.tenantId, page, limit);
    sendSuccess(res, 200, "Categories retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.categoriesService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Category retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.categoriesService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Category updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.categoriesService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };
}
