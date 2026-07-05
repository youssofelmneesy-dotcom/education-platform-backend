import type { Request, Response } from "express";
import type { ICoursesController, ICoursesService } from "../interfaces/index.js";
import { CoursesService } from "../services/index.js";
import { createCourseSchema, updateCourseSchema } from "../validators/index.js";
import { CourseNotFoundError, DuplicateCourseSlugError } from "../utils/index.js";

export class CoursesController implements ICoursesController {
  constructor(private readonly coursesService: ICoursesService = new CoursesService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createCourseSchema.safeParse(req.body);

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
      const data = await this.coursesService.create(req.user.tenantId, validationResult.data);

      res.status(201).json({ success: true, message: "Course created successfully", data });
    } catch (error) {
      if (error instanceof DuplicateCourseSlugError) {
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
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    try {
      const data = await this.coursesService.list(req.user.tenantId, page, limit, search);

      res.status(200).json({ success: true, message: "Courses retrieved successfully", data });
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
      const data = await this.coursesService.getById(id, req.user.tenantId);

      res.status(200).json({ success: true, message: "Course retrieved successfully", data });
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateCourseSchema.safeParse(req.body);

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
      const data = await this.coursesService.updateById(id, req.user.tenantId, validationResult.data);

      res.status(200).json({ success: true, message: "Course updated successfully", data });
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      if (error instanceof DuplicateCourseSlugError) {
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
      await this.coursesService.deleteById(id, req.user.tenantId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
