import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { VideoListQueryDto } from "../dto/index.js";
import type { IVideosController, IVideosService } from "../interfaces/index.js";
import { VideosService } from "../services/index.js";

export class VideosController implements IVideosController {
  constructor(private readonly videosService: IVideosService = new VideosService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.create(req.user.tenantId, req.body);
    sendSuccess(res, 201, "Video created successfully", data);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.list(req.user.tenantId, req.query as unknown as VideoListQueryDto);
    sendSuccess(res, 200, "Videos retrieved successfully", data);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.videosService.getById(id, req.user.tenantId);
    sendSuccess(res, 200, "Video retrieved successfully", data);
  };

  updateById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.videosService.updateById(id, req.user.tenantId, req.body);
    sendSuccess(res, 200, "Video updated successfully", data);
  };

  deleteById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await this.videosService.deleteById(id, req.user.tenantId);
    res.status(204).send();
  };

  getPreviousVideo = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.getPreviousVideo(this.getParam(req, "id"), req.user.tenantId);
    sendSuccess(res, 200, "Previous video retrieved successfully", data);
  };

  getNextVideo = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.getNextVideo(this.getParam(req, "id"), req.user.tenantId);
    sendSuccess(res, 200, "Next video retrieved successfully", data);
  };

  listLessonVideos = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.listLessonVideos(this.getParam(req, "lessonId"), req.user.tenantId);
    sendSuccess(res, 200, "Lesson videos retrieved successfully", data);
  };

  createChapter = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.createChapter(this.getParam(req, "id"), req.user.tenantId, req.body);
    sendSuccess(res, 201, "Video chapter created successfully", data);
  };

  listChapters = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.listChapters(this.getParam(req, "id"), req.user.tenantId);
    sendSuccess(res, 200, "Video chapters retrieved successfully", data);
  };

  getChapterById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.getChapterById(this.getParam(req, "id"), this.getParam(req, "chapterId"), req.user.tenantId);
    sendSuccess(res, 200, "Video chapter retrieved successfully", data);
  };

  updateChapter = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.updateChapter(this.getParam(req, "id"), this.getParam(req, "chapterId"), req.user.tenantId, req.body);
    sendSuccess(res, 200, "Video chapter updated successfully", data);
  };

  deleteChapter = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    await this.videosService.deleteChapter(this.getParam(req, "id"), this.getParam(req, "chapterId"), req.user.tenantId);
    res.status(204).send();
  };

  createSubtitle = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.createSubtitle(this.getParam(req, "id"), req.user.tenantId, req.body);
    sendSuccess(res, 201, "Video subtitle created successfully", data);
  };

  listSubtitles = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.listSubtitles(this.getParam(req, "id"), req.user.tenantId);
    sendSuccess(res, 200, "Video subtitles retrieved successfully", data);
  };

  getSubtitleById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.getSubtitleById(this.getParam(req, "id"), this.getParam(req, "subtitleId"), req.user.tenantId);
    sendSuccess(res, 200, "Video subtitle retrieved successfully", data);
  };

  updateSubtitle = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.updateSubtitle(this.getParam(req, "id"), this.getParam(req, "subtitleId"), req.user.tenantId, req.body);
    sendSuccess(res, 200, "Video subtitle updated successfully", data);
  };

  deleteSubtitle = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    await this.videosService.deleteSubtitle(this.getParam(req, "id"), this.getParam(req, "subtitleId"), req.user.tenantId);
    res.status(204).send();
  };

  getStatistics = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const data = await this.videosService.getStatistics(req.user.tenantId);
    sendSuccess(res, 200, "Video statistics retrieved successfully", data);
  };

  private getParam(req: Request, name: string): string {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
