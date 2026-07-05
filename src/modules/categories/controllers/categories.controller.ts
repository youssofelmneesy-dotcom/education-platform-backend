import type { Request, Response } from "express";
import type { ICategoriesController, ICategoriesService } from "../interfaces/index.js";
import { CategoriesService } from "../services/index.js";
import { createCategorySchema, updateCategorySchema } from "../validators/index.js";
import { CategoryNotFoundError, DuplicateCategorySlugError } from "../utils/index.js";

export class CategoriesController implements ICategoriesController {
  constructor(private readonly categoriesService: ICategoriesService = new CategoriesService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createCategorySchema.safeParse(req.body);

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
      const data = await this.categoriesService.create(req.user.tenantId, validationResult.data);

      res.status(201).json({ success: true, message: "Category created successfully", data });
    } catch (error) {
      if (error instanceof DuplicateCategorySlugError) {
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
      const data = await this.categoriesService.list(req.user.tenantId, page, limit);

      res.status(200).json({ success: true, message: "Categories retrieved successfully", data });
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
      const data = await this.categoriesService.getById(id, req.user.tenantId);

      res.status(200).json({ success: true, message: "Category retrieved successfully", data });
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateCategorySchema.safeParse(req.body);

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
      const data = await this.categoriesService.updateById(id, req.user.tenantId, validationResult.data);

      res.status(200).json({ success: true, message: "Category updated successfully", data });
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      if (error instanceof DuplicateCategorySlugError) {
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
      await this.categoriesService.deleteById(id, req.user.tenantId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
