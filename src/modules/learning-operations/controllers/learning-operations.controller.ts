import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/index.js";
import { sendSuccess } from "../../../shared/utils/index.js";
import type { AssignmentListQueryDto, CertificateListQueryDto } from "../dto/index.js";
import type { ILearningOperationsService } from "../interfaces/index.js";
import { LearningOperationsService } from "../services/index.js";

export class LearningOperationsController {
  constructor(private readonly service: ILearningOperationsService = new LearningOperationsService()) {}
  createAssignment = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 201, "Assignment created successfully", await this.service.createAssignment(tenantId, userId, req.body)); };
  listAssignments = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Assignments retrieved successfully", await this.service.listAssignments(tenantId, req.query as unknown as AssignmentListQueryDto)); };
  getAssignment = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Assignment retrieved successfully", await this.service.getAssignment(this.param(req, "id"), tenantId)); };
  updateAssignment = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Assignment updated successfully", await this.service.updateAssignment(this.param(req, "id"), tenantId, req.body)); };
  deleteAssignment = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.service.deleteAssignment(this.param(req, "id"), tenantId); res.status(204).send(); };
  restoreAssignment = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Assignment restored successfully", await this.service.restoreAssignment(this.param(req, "id"), tenantId)); };
  createSubmission = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 201, "Submission created successfully", await this.service.createSubmission(this.param(req, "assignmentId"), userId, tenantId, req.body)); };
  updateSubmission = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Submission updated successfully", await this.service.updateSubmission(this.param(req, "id"), userId, tenantId, req.body)); };
  submitSubmission = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Submission submitted successfully", await this.service.submitSubmission(this.param(req, "id"), userId, tenantId)); };
  getSubmission = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Submission retrieved successfully", await this.service.getSubmission(this.param(req, "id"), userId, tenantId)); };
  listMySubmissions = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Submissions retrieved successfully", await this.service.listMySubmissions(userId, tenantId)); };
  listAssignmentSubmissions = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Assignment submissions retrieved successfully", await this.service.listAssignmentSubmissions(this.param(req, "assignmentId"), tenantId)); };
  gradeSubmission = async (req: Request, res: Response): Promise<void> => { const { userId, tenantId } = this.auth(req); sendSuccess(res, 200, "Submission graded successfully", await this.service.gradeSubmission(this.param(req, "id"), userId, tenantId, req.body)); };
  createRubric = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Rubric created successfully", await this.service.createRubric(this.param(req, "assignmentId"), tenantId, req.body)); };
  listRubrics = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Rubrics retrieved successfully", await this.service.listRubrics(this.param(req, "assignmentId"), tenantId)); };
  updateRubric = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Rubric updated successfully", await this.service.updateRubric(this.param(req, "assignmentId"), this.param(req, "id"), tenantId, req.body)); };
  deleteRubric = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.service.deleteRubric(this.param(req, "assignmentId"), this.param(req, "id"), tenantId); res.status(204).send(); };
  createTemplate = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Certificate template created successfully", await this.service.createTemplate(tenantId, req.body)); };
  listTemplates = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Certificate templates retrieved successfully", await this.service.listTemplates(tenantId)); };
  updateTemplate = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Certificate template updated successfully", await this.service.updateTemplate(this.param(req, "id"), tenantId, req.body)); };
  deleteTemplate = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); await this.service.deleteTemplate(this.param(req, "id"), tenantId); res.status(204).send(); };
  generateCertificate = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 201, "Certificate generated successfully", await this.service.generateCertificate(tenantId, req.body)); };
  listCertificates = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Certificates retrieved successfully", await this.service.listCertificates(tenantId, req.query as unknown as CertificateListQueryDto)); };
  getCertificate = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Certificate retrieved successfully", await this.service.getCertificate(this.param(req, "certificateNumber"), tenantId)); };
  verifyCertificate = async (req: Request, res: Response): Promise<void> => { sendSuccess(res, 200, "Certificate verified successfully", await this.service.verifyCertificate(this.param(req, "verificationCode"))); };
  revokeCertificate = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Certificate revoked successfully", await this.service.revokeCertificate(this.param(req, "id"), tenantId)); };
  getStatistics = async (req: Request, res: Response): Promise<void> => { const { tenantId } = this.auth(req); sendSuccess(res, 200, "Learning operations statistics retrieved successfully", await this.service.getStatistics(tenantId)); };
  private auth(req: Request): { userId: string; tenantId: string } { if (!req.user) throw new UnauthorizedError(); return { userId: req.user.sub, tenantId: req.user.tenantId }; }
  private param(req: Request, name: string): string { const value = req.params[name]; return Array.isArray(value) ? value[0] : value; }
}
