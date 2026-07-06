import type { Request, Response } from "express";
export interface IAssessmentController {
  createExam(req: Request, res: Response): Promise<void>; listExams(req: Request, res: Response): Promise<void>; getExam(req: Request, res: Response): Promise<void>; updateExam(req: Request, res: Response): Promise<void>; deleteExam(req: Request, res: Response): Promise<void>; restoreExam(req: Request, res: Response): Promise<void>;
  assignQuestion(req: Request, res: Response): Promise<void>; listExamQuestions(req: Request, res: Response): Promise<void>; removeQuestion(req: Request, res: Response): Promise<void>; reorderQuestions(req: Request, res: Response): Promise<void>;
  startAttempt(req: Request, res: Response): Promise<void>; resumeAttempt(req: Request, res: Response): Promise<void>; saveAnswer(req: Request, res: Response): Promise<void>; clearAnswer(req: Request, res: Response): Promise<void>; submitAttempt(req: Request, res: Response): Promise<void>; cancelAttempt(req: Request, res: Response): Promise<void>;
  gradeAnswer(req: Request, res: Response): Promise<void>; getResult(req: Request, res: Response): Promise<void>; getReview(req: Request, res: Response): Promise<void>; getStatistics(req: Request, res: Response): Promise<void>;
}
