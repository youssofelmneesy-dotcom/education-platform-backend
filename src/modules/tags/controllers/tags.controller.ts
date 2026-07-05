import type { Request, Response } from "express";
import type { ITagsController, ITagsService } from "../interfaces/index.js";
import { TagsService } from "../services/index.js";
import { createTagSchema, updateTagSchema } from "../validators/index.js";
import { TagNotFoundError, DuplicateTagSlugError } from "../utils/index.js";

export class TagsController implements ITagsController {
  constructor(private readonly tagsService: ITagsService = new TagsService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createTagSchema.safeParse(req.body);

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
      const data = await this.tagsService.create(req.user.tenantId, validationResult.data);

      res.status(201).json({ success: true, message: "Tag created successfully", data });
    } catch (error) {
      if (error instanceof DuplicateTagSlugError) {
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
      const data = await this.tagsService.list(req.user.tenantId, page, limit);

      res.status(200).json({ success: true, message: "Tags retrieved successfully", data });
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
      const data = await this.tagsService.getById(id, req.user.tenantId);

      res.status(200).json({ success: true, message: "Tag retrieved successfully", data });
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateTagSchema.safeParse(req.body);

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
      const data = await this.tagsService.updateById(id, req.user.tenantId, validationResult.data);

      res.status(200).json({ success: true, message: "Tag updated successfully", data });
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      if (error instanceof DuplicateTagSlugError) {
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
      await this.tagsService.deleteById(id, req.user.tenantId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
