import type { Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { QuestionListQueryDto, ReorderChoiceDto } from "../dto/index.js";
import type { IQuestionBankController, IQuestionBankService } from "../interfaces/index.js";
import { QuestionBankService } from "../services/index.js";

export class QuestionBankController implements IQuestionBankController {
  constructor(private readonly questionBankService: IQuestionBankService = new QuestionBankService()) {}

  createQuestion = async (req: Request, res: Response): Promise<void> => {
    const { userId, tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.createQuestion(tenantId, userId, req.body);
    sendSuccess(res, 201, "Question created successfully", data);
  };

  listQuestions = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.listQuestions(tenantId, req.query as unknown as QuestionListQueryDto);
    sendSuccess(res, 200, "Questions retrieved successfully", data);
  };

  getQuestionById = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.getQuestionById(this.getParam(req, "id"), tenantId);
    sendSuccess(res, 200, "Question retrieved successfully", data);
  };

  updateQuestion = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.updateQuestion(this.getParam(req, "id"), tenantId, req.body);
    sendSuccess(res, 200, "Question updated successfully", data);
  };

  deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    await this.questionBankService.deleteQuestion(this.getParam(req, "id"), tenantId);
    res.status(204).send();
  };

  restoreQuestion = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.restoreQuestion(this.getParam(req, "id"), tenantId);
    sendSuccess(res, 200, "Question restored successfully", data);
  };

  createChoice = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.createChoice(this.getParam(req, "id"), tenantId, req.body);
    sendSuccess(res, 201, "Question choice created successfully", data);
  };

  updateChoice = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.updateChoice(this.getParam(req, "id"), this.getParam(req, "choiceId"), tenantId, req.body);
    sendSuccess(res, 200, "Question choice updated successfully", data);
  };

  deleteChoice = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    await this.questionBankService.deleteChoice(this.getParam(req, "id"), this.getParam(req, "choiceId"), tenantId);
    res.status(204).send();
  };

  reorderChoices = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.reorderChoices(this.getParam(req, "id"), tenantId, req.body.choices as ReorderChoiceDto[]);
    sendSuccess(res, 200, "Question choices reordered successfully", data);
  };

  markCorrectChoice = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.markCorrectChoice(this.getParam(req, "id"), req.body.choiceId as string, tenantId);
    sendSuccess(res, 200, "Correct choice updated successfully", data);
  };

  attachToPool = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.attachToPool(this.getParam(req, "id"), tenantId, req.body);
    sendSuccess(res, 201, "Question attached to pool successfully", data);
  };

  listPools = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.listPools(this.getParam(req, "id"), tenantId);
    sendSuccess(res, 200, "Question pools retrieved successfully", data);
  };

  removeFromPool = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    await this.questionBankService.removeFromPool(this.getParam(req, "id"), this.getParam(req, "poolId"), tenantId);
    res.status(204).send();
  };

  getStatistics = async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = this.getAuthContext(req);
    const data = await this.questionBankService.getStatistics(tenantId);
    sendSuccess(res, 200, "Question statistics retrieved successfully", data);
  };

  private getAuthContext(req: Request): { userId: string; tenantId: string } {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    return { userId: req.user.sub, tenantId: req.user.tenantId };
  }

  private getParam(req: Request, name: string): string {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
  }
}
