import type { Request, Response } from "express";
export interface ILearningOperationsController { [key: string]: (req: Request, res: Response) => Promise<void> }
