import type { Request, Response } from "express";

export interface IQuestionBankController {
  createQuestion(req: Request, res: Response): Promise<void>;
  listQuestions(req: Request, res: Response): Promise<void>;
  getQuestionById(req: Request, res: Response): Promise<void>;
  updateQuestion(req: Request, res: Response): Promise<void>;
  deleteQuestion(req: Request, res: Response): Promise<void>;
  restoreQuestion(req: Request, res: Response): Promise<void>;
  createChoice(req: Request, res: Response): Promise<void>;
  updateChoice(req: Request, res: Response): Promise<void>;
  deleteChoice(req: Request, res: Response): Promise<void>;
  reorderChoices(req: Request, res: Response): Promise<void>;
  markCorrectChoice(req: Request, res: Response): Promise<void>;
  attachToPool(req: Request, res: Response): Promise<void>;
  listPools(req: Request, res: Response): Promise<void>;
  removeFromPool(req: Request, res: Response): Promise<void>;
  getStatistics(req: Request, res: Response): Promise<void>;
}
