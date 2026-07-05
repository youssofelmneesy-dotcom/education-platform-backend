import type { Request, Response } from "express";

export interface ILessonsController {
  create(req: Request, res: Response): Promise<void>;
  listByCourse(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  updateById(req: Request, res: Response): Promise<void>;
  deleteById(req: Request, res: Response): Promise<void>;
}
