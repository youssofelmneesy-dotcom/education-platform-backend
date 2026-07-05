import type { Request, Response } from "express";
import type { IVideosController, IVideosService } from "../interfaces/index.js";
import { VideosService } from "../services/index.js";
import { createVideoSchema, updateVideoSchema } from "../validators/index.js";
import { VideoNotFoundError, VideoAlreadyExistsForLessonError, LessonNotFoundError } from "../utils/index.js";

export class VideosController implements IVideosController {
  constructor(private readonly videosService: IVideosService = new VideosService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createVideoSchema.safeParse(req.body);

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
      const data = await this.videosService.create(req.user.tenantId, validationResult.data);

      res.status(201).json({ success: true, message: "Video created successfully", data });
    } catch (error) {
      if (error instanceof VideoAlreadyExistsForLessonError) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

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
      const data = await this.videosService.getById(id, req.user.tenantId);

      res.status(200).json({ success: true, message: "Video retrieved successfully", data });
    } catch (error) {
      if (error instanceof VideoNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    const validationResult = updateVideoSchema.safeParse(req.body);

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
      const data = await this.videosService.updateById(id, req.user.tenantId, validationResult.data);

      res.status(200).json({ success: true, message: "Video updated successfully", data });
    } catch (error) {
      if (error instanceof VideoNotFoundError) {
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
      await this.videosService.deleteById(id, req.user.tenantId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof VideoNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
