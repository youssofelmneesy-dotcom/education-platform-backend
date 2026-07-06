import type { Request, Response } from "express";
import { AppError, UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ILessonAttachmentsController, ILessonAttachmentsService } from "../interfaces/index.js";
import { LessonAttachmentsService } from "../services/index.js";

export class LessonAttachmentsController implements ILessonAttachmentsController {
  constructor(private readonly lessonAttachmentsService: ILessonAttachmentsService = new LessonAttachmentsService()) {}

  private getQueryString(value: string | string[] | undefined): string | undefined {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      const firstValue = value[0];
      return typeof firstValue === "string" ? firstValue : undefined;
    }

    return undefined;
  }

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.lessonAttachmentsService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Lesson attachment created successfully", data);
  };

  listByLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const lessonId = this.getQueryString(req.query.lessonId as string | string[] | undefined);

    if (!lessonId) {
      throw new AppError("lessonId is required", 400, "LESSON_ID_REQUIRED");
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const search = this.getQueryString(req.query.search as string | string[] | undefined);

    const data = await this.lessonAttachmentsService.listByLesson(req.user.tenantId, lessonId, page, limit, search);
    sendSuccess(res, 200, "Lesson attachments retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.lessonAttachmentsService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Lesson attachment retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.lessonAttachmentsService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Lesson attachment updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.lessonAttachmentsService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };
}
