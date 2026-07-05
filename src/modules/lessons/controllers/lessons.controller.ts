import type { Request, Response } from "express";
import type { ILessonsController, ILessonsService } from "../interfaces/index.js";
import { LessonsService } from "../services/index.js";
import { createLessonSchema, updateLessonSchema } from "../validators/index.js";
import { LessonNotFoundError, DuplicateLessonSlugError, CourseNotFoundError } from "../utils/index.js";

export class LessonsController implements ILessonsController {
  constructor(private readonly lessonsService: ILessonsService = new LessonsService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createLessonSchema.safeParse(req.body);

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
      const data = await this.lessonsService.create(req.user.tenantId, validationResult.data);

      res.status(201).json({ success: true, message: "Lesson created successfully", data });
    } catch (error) {
      if (error instanceof DuplicateLessonSlugError) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

      if (error instanceof CourseNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  listByCourse = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const search = Array.isArray(req.query.search) ? (req.query.search[0] as string) : (req.query.search as string | undefined);

    try {
      const data = await this.lessonsService.listByCourse(req.user.tenantId, courseId, page, limit, search);

      res.status(200).json({ success: true, message: "Lessons retrieved successfully", data });
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
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
      const data = await this.lessonsService.getById(id, req.user.tenantId);

      res.status(200).json({ success: true, message: "Lesson retrieved successfully", data });
    } catch (error) {
      if (error instanceof LessonNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateLessonSchema.safeParse(req.body);

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
      const data = await this.lessonsService.updateById(id, req.user.tenantId, validationResult.data);

      res.status(200).json({ success: true, message: "Lesson updated successfully", data });
    } catch (error) {
      if (error instanceof LessonNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      if (error instanceof DuplicateLessonSlugError) {
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
      await this.lessonsService.deleteById(id, req.user.tenantId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof LessonNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
