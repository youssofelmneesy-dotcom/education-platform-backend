import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ICoursesController, ICoursesService } from "../interfaces/index.js";
import { CoursesService } from "../services/index.js";

export class CoursesController implements ICoursesController {
  constructor(private readonly coursesService: ICoursesService = new CoursesService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.coursesService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Course created successfully", data);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const data = await this.coursesService.list(req.user.tenantId, page, limit, search);
    sendSuccess(res, 200, "Courses retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.coursesService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Course retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.coursesService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Course updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.coursesService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };
}
