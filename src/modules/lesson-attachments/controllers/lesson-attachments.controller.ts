import type { Request, Response } from "express";
import type { ILessonAttachmentsController, ILessonAttachmentsService } from "../interfaces/index.js";
import { LessonAttachmentsService } from "../services/index.js";
import { createLessonAttachmentSchema, updateLessonAttachmentSchema } from "../validators/index.js";
import { LessonAttachmentNotFoundError, LessonNotFoundError } from "../utils/index.js";

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
    const validationResult = createLessonAttachmentSchema.safeParse(req.body);

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
      const data = await this.lessonAttachmentsService.create(req.user.tenantId, validationResult.data);
      res.status(201).json({ success: true, message: "Lesson attachment created successfully", data });
    } catch (error) {
      if (error instanceof LessonNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  listByLesson = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const lessonId = this.getQueryString(req.query.lessonId as string | string[] | undefined);

    if (!lessonId) {
      res.status(400).json({ success: false, message: "lessonId is required" });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const search = this.getQueryString(req.query.search as string | string[] | undefined);

    try {
      const data = await this.lessonAttachmentsService.listByLesson(req.user.tenantId, lessonId, page, limit, search);
      res.status(200).json({ success: true, message: "Lesson attachments retrieved successfully", data });
    } catch (error) {
      if (error instanceof LessonNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

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
      const data = await this.lessonAttachmentsService.getById(id, req.user.tenantId);
      res.status(200).json({ success: true, message: "Lesson attachment retrieved successfully", data });
    } catch (error) {
      if (error instanceof LessonAttachmentNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateLessonAttachmentSchema.safeParse(req.body);

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
      const data = await this.lessonAttachmentsService.updateById(id, req.user.tenantId, validationResult.data);
      res.status(200).json({ success: true, message: "Lesson attachment updated successfully", data });
    } catch (error) {
      if (error instanceof LessonAttachmentNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
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
      await this.lessonAttachmentsService.deleteById(id, req.user.tenantId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof LessonAttachmentNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
