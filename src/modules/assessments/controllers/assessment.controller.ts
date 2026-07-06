import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { ExamListQueryDto, ReorderExamQuestionDto } from "../dto/index.js";
import type { IAssessmentController, IAssessmentService } from "../interfaces/index.js";
import { AssessmentService } from "../services/index.js";

export class AssessmentController implements IAssessmentController {
  constructor(private readonly assessmentService: IAssessmentService = new AssessmentService()) {}
  createExam = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Exam created successfully", await this.assessmentService.createExam(tenantId, req.body)); };
  listExams = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Exams retrieved successfully", await this.assessmentService.listExams(tenantId, req.query as unknown as ExamListQueryDto)); };
  getExam = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Exam retrieved successfully", await this.assessmentService.getExam(this.param(req, "id"), tenantId)); };
  updateExam = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Exam updated successfully", await this.assessmentService.updateExam(this.param(req, "id"), tenantId, req.body)); };
  deleteExam = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.assessmentService.deleteExam(this.param(req, "id"), tenantId); res.status(204).send(); };
  restoreExam = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Exam restored successfully", await this.assessmentService.restoreExam(this.param(req, "id"), tenantId)); };
  assignQuestion = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Question assigned successfully", await this.assessmentService.assignQuestion(this.param(req, "id"), tenantId, req.body)); };
  listExamQuestions = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Exam questions retrieved successfully", await this.assessmentService.listExamQuestions(this.param(req, "id"), tenantId)); };
  removeQuestion = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.assessmentService.removeQuestion(this.param(req, "id"), this.param(req, "poolId"), tenantId); res.status(204).send(); };
  reorderQuestions = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Exam questions reordered successfully", await this.assessmentService.reorderQuestions(this.param(req, "id"), tenantId, req.body.questions as ReorderExamQuestionDto[])); };
  startAttempt = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 201, "Exam attempt started successfully", await this.assessmentService.startAttempt(this.param(req, "id"), userId, tenantId)); };
  resumeAttempt = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Exam attempt resumed successfully", await this.assessmentService.resumeAttempt(this.param(req, "id"), userId, tenantId)); };
  saveAnswer = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Answer saved successfully", await this.assessmentService.saveAnswer(this.param(req, "attemptId"), userId, tenantId, req.body)); };
  clearAnswer = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); await this.assessmentService.clearAnswer(this.param(req, "attemptId"), this.param(req, "answerId"), userId, tenantId); res.status(204).send(); };
  submitAttempt = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Exam attempt submitted successfully", await this.assessmentService.submitAttempt(this.param(req, "attemptId"), userId, tenantId)); };
  cancelAttempt = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Exam attempt cancelled successfully", await this.assessmentService.cancelAttempt(this.param(req, "attemptId"), userId, tenantId)); };
  gradeAnswer = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Answer graded successfully", await this.assessmentService.gradeAnswer(this.param(req, "answerId"), tenantId, req.body)); };
  getResult = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Exam result retrieved successfully", await this.assessmentService.getResult(this.param(req, "attemptId"), userId, tenantId)); };
  getReview = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Exam review retrieved successfully", await this.assessmentService.getReview(this.param(req, "attemptId"), userId, tenantId)); };
  getStatistics = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Assessment statistics retrieved successfully", await this.assessmentService.getStatistics(tenantId)); };
  private auth(req: Request): { userId: string; tenantId: string } { if (!req.user) throw new UnauthorizedError(); return { userId: req.user.sub, tenantId: req.user.tenantId }; }
  private param(req: Request, name: string): string { const value = req.params[name]; return Array.isArray(value) ? value[0] : value; }
}
