import type { Request, Response } from "express";

export interface ITagsController {
  create(req: Request, res: Response): Promise<void>;
  list(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  updateById(req: Request, res: Response): Promise<void>;
  deleteById(req: Request, res: Response): Promise<void>;
}
