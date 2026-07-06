import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ILessonsController, ILessonsService } from "../interfaces/index.js";
import { LessonsService } from "../services/index.js";

export class LessonsController implements ILessonsController {
  constructor(private readonly lessonsService: ILessonsService = new LessonsService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.lessonsService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Lesson created successfully", data);
  };

  listByCourse = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const search = Array.isArray(req.query.search) ? (req.query.search[0] as string) : (req.query.search as string | undefined);

    const data = await this.lessonsService.listByCourse(req.user.tenantId, courseId, page, limit, search);
    sendSuccess(res, 200, "Lessons retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.lessonsService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Lesson retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.lessonsService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Lesson updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.lessonsService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };
}
