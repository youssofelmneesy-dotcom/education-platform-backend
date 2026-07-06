import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ITagsController, ITagsService } from "../interfaces/index.js";
import { TagsService } from "../services/index.js";

export class TagsController implements ITagsController {
  constructor(private readonly tagsService: ITagsService = new TagsService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.tagsService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Tag created successfully", data);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const data = await this.tagsService.list(req.user.tenantId, page, limit);
    sendSuccess(res, 200, "Tags retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.tagsService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Tag retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.tagsService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Tag updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.tagsService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };
}
