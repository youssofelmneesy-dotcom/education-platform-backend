import type { Request, Response } from "express";

export interface ILessonAttachmentsController {
  create(req: Request, res: Response): Promise<void>;
  listByLesson(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  updateById(req: Request, res: Response): Promise<void>;
  deleteById(req: Request, res: Response): Promise<void>;
}
