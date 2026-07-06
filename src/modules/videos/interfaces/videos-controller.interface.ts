import type { Request, Response } from "express";

export interface IVideosController {
  create(req: Request, res: Response): Promise<void>;
  list(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  updateById(req: Request, res: Response): Promise<void>;
  deleteById(req: Request, res: Response): Promise<void>;
  getPreviousVideo(req: Request, res: Response): Promise<void>;
  getNextVideo(req: Request, res: Response): Promise<void>;
  listLessonVideos(req: Request, res: Response): Promise<void>;
  createChapter(req: Request, res: Response): Promise<void>;
  listChapters(req: Request, res: Response): Promise<void>;
  getChapterById(req: Request, res: Response): Promise<void>;
  updateChapter(req: Request, res: Response): Promise<void>;
  deleteChapter(req: Request, res: Response): Promise<void>;
  createSubtitle(req: Request, res: Response): Promise<void>;
  listSubtitles(req: Request, res: Response): Promise<void>;
  getSubtitleById(req: Request, res: Response): Promise<void>;
  updateSubtitle(req: Request, res: Response): Promise<void>;
  deleteSubtitle(req: Request, res: Response): Promise<void>;
  getStatistics(req: Request, res: Response): Promise<void>;
}
