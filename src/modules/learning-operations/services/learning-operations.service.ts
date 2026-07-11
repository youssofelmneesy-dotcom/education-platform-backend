import type {
  AssignmentDto,
  AssignmentListQueryDto,
  AssignmentsListDto,
  CertificateDto,
  CertificateListQueryDto,
  CertificatesListDto,
  CertificateTemplateDto,
  CreateAssignmentDto,
  CreateCertificateTemplateDto,
  CreateRubricDto,
  CreateSubmissionDto,
  GenerateCertificateDto,
  GradeDto,
  GradeSubmissionDto,
  LearningOperationsStatisticsDto,
  RubricDto,
  SubmissionDto,
  UpdateAssignmentDto,
  UpdateCertificateTemplateDto,
  UpdateRubricDto,
  UpdateSubmissionDto,
} from "../dto/index.js";
import type { ILearningOperationsRepository, ILearningOperationsService } from "../interfaces/index.js";
import { LearningOperationsRepository } from "../repositories/index.js";
import {
  AssignmentNotFoundError,
  CertificateNotFoundError,
  CertificateTemplateNotFoundError,
  CertificateVerificationNotFoundError,
  RelatedLearningResourceNotFoundError,
  RubricNotFoundError,
  SubmissionNotFoundError,
} from "../utils/index.js";

export class LearningOperationsService implements ILearningOperationsService {
  constructor(private readonly repo: ILearningOperationsRepository = new LearningOperationsRepository()) {}

  async createAssignment(tenantId: string, createdById: string | null, data: CreateAssignmentDto): Promise<AssignmentDto> {
    await this.ensureAssignmentResources(tenantId, data);
    return this.mapAssignment(await this.repo.createAssignment(tenantId, createdById, data));
  }
  async listAssignments(tenantId: string, query: AssignmentListQueryDto): Promise<AssignmentsListDto> {
    const { assignments, total } = await this.repo.listAssignments(tenantId, query);
    return { assignments: assignments.map((assignment) => this.mapAssignment(assignment)), total, page: query.page, limit: query.limit };
  }
  async getAssignment(id: string, tenantId: string): Promise<AssignmentDto> { return this.mapAssignment(await this.ensureAssignment(id, tenantId)); }
  async updateAssignment(id: string, tenantId: string, data: UpdateAssignmentDto): Promise<AssignmentDto> {
    await this.ensureAssignment(id, tenantId);
    await this.ensureAssignmentResources(tenantId, data);
    const assignment = await this.repo.updateAssignment(id, tenantId, data);
    if (!assignment) throw new AssignmentNotFoundError();
    return this.mapAssignment(assignment);
  }
  async deleteAssignment(id: string, tenantId: string): Promise<void> { if (!(await this.repo.softDeleteAssignment(id, tenantId))) throw new AssignmentNotFoundError(); }
  async restoreAssignment(id: string, tenantId: string): Promise<AssignmentDto> {
    const assignment = await this.repo.restoreAssignment(id, tenantId);
    if (!assignment) throw new AssignmentNotFoundError();
    return this.mapAssignment(assignment);
  }

  async createSubmission(assignmentId: string, userId: string, tenantId: string, data: CreateSubmissionDto): Promise<SubmissionDto> {
    await this.ensureAssignment(assignmentId, tenantId);
    return this.mapSubmission(await this.repo.createSubmission(assignmentId, userId, tenantId, data));
  }
  async updateSubmission(submissionId: string, userId: string | null, tenantId: string, data: UpdateSubmissionDto): Promise<SubmissionDto> {
    const submission = await this.repo.updateSubmission(submissionId, userId, tenantId, data);
    if (!submission) throw new SubmissionNotFoundError();
    return this.mapSubmission(submission);
  }
  async submitSubmission(submissionId: string, userId: string, tenantId: string): Promise<SubmissionDto> {
    const submission = await this.repo.submitSubmission(submissionId, userId, tenantId);
    if (!submission) throw new SubmissionNotFoundError();
    return this.mapSubmission(submission);
  }
  async getSubmission(submissionId: string, userId: string | null, tenantId: string): Promise<SubmissionDto> {
    const submission = await this.repo.findSubmissionById(submissionId, userId, tenantId);
    if (!submission) throw new SubmissionNotFoundError();
    return this.mapSubmission(submission);
  }
  async listMySubmissions(userId: string, tenantId: string): Promise<SubmissionDto[]> { return (await this.repo.listMySubmissions(userId, tenantId)).map((item) => this.mapSubmission(item)); }
  async listAssignmentSubmissions(assignmentId: string, tenantId: string): Promise<SubmissionDto[]> {
    await this.ensureAssignment(assignmentId, tenantId);
    return (await this.repo.listAssignmentSubmissions(assignmentId, tenantId)).map((item) => this.mapSubmission(item));
  }
  async gradeSubmission(submissionId: string, graderId: string | null, tenantId: string, data: GradeSubmissionDto): Promise<GradeDto> {
    const grade = await this.repo.gradeSubmission(submissionId, graderId, tenantId, data);
    if (!grade) throw new SubmissionNotFoundError();
    return this.mapGrade(grade);
  }

  async createRubric(assignmentId: string, tenantId: string, data: CreateRubricDto): Promise<RubricDto> { await this.ensureAssignment(assignmentId, tenantId); return this.mapRubric(await this.repo.createRubric(assignmentId, tenantId, data)); }
  async listRubrics(assignmentId: string, tenantId: string): Promise<RubricDto[]> { await this.ensureAssignment(assignmentId, tenantId); return (await this.repo.listRubrics(assignmentId, tenantId)).map((item) => this.mapRubric(item)); }
  async updateRubric(assignmentId: string, rubricId: string, tenantId: string, data: UpdateRubricDto): Promise<RubricDto> {
    const rubric = await this.repo.updateRubric(assignmentId, rubricId, tenantId, data);
    if (!rubric) throw new RubricNotFoundError();
    return this.mapRubric(rubric);
  }
  async deleteRubric(assignmentId: string, rubricId: string, tenantId: string): Promise<void> { if (!(await this.repo.deleteRubric(assignmentId, rubricId, tenantId))) throw new RubricNotFoundError(); }

  async createTemplate(tenantId: string, data: CreateCertificateTemplateDto): Promise<CertificateTemplateDto> { return this.mapTemplate(await this.repo.createTemplate(tenantId, data)); }
  async listTemplates(tenantId: string): Promise<CertificateTemplateDto[]> { return (await this.repo.listTemplates(tenantId)).map((item) => this.mapTemplate(item)); }
  async updateTemplate(id: string, tenantId: string, data: UpdateCertificateTemplateDto): Promise<CertificateTemplateDto> {
    const template = await this.repo.updateTemplate(id, tenantId, data);
    if (!template) throw new CertificateTemplateNotFoundError();
    return this.mapTemplate(template);
  }
  async deleteTemplate(id: string, tenantId: string): Promise<void> { if (!(await this.repo.deleteTemplate(id, tenantId))) throw new CertificateTemplateNotFoundError(); }
  async generateCertificate(tenantId: string, data: GenerateCertificateDto): Promise<CertificateDto> {
    if (!(await this.repo.certificateResourcesExist(tenantId, data))) throw new RelatedLearningResourceNotFoundError();
    const entropy = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
    const certificate = await this.repo.generateCertificate(tenantId, `CERT-${entropy}`, `VERIFY-${entropy}`, data);
    if (!certificate) throw new CertificateNotFoundError();
    return this.mapCertificate(certificate);
  }
  async getCertificate(certificateNumber: string, tenantId: string): Promise<CertificateDto> {
    const certificate = await this.repo.findCertificateByNumber(certificateNumber, tenantId);
    if (!certificate) throw new CertificateNotFoundError();
    return this.mapCertificate(certificate);
  }
  async verifyCertificate(verificationCode: string): Promise<CertificateDto> {
    try {
      return this.mapCertificate(await this.repo.verifyCertificate(verificationCode));
    } catch {
      throw new CertificateVerificationNotFoundError();
    }
  }
  async listCertificates(tenantId: string, query: CertificateListQueryDto): Promise<CertificatesListDto> {
    const { certificates, total } = await this.repo.listCertificates(tenantId, query);
    return { certificates: certificates.map((item) => this.mapCertificate(item)), total, page: query.page, limit: query.limit };
  }
  async revokeCertificate(id: string, tenantId: string): Promise<CertificateDto> {
    const certificate = await this.repo.revokeCertificate(id, tenantId);
    if (!certificate) throw new CertificateNotFoundError();
    return this.mapCertificate(certificate);
  }
  async getStatistics(tenantId: string): Promise<LearningOperationsStatisticsDto> { return this.repo.getStatistics(tenantId); }

  private async ensureAssignmentResources(tenantId: string, data: { courseId?: string; lessonId?: string | null }): Promise<void> { if (!(await this.repo.relatedAssignmentResourcesExist(tenantId, data))) throw new RelatedLearningResourceNotFoundError(); }
  private async ensureAssignment(id: string, tenantId: string): Promise<any> { const assignment = await this.repo.findAssignmentById(id, tenantId); if (!assignment) throw new AssignmentNotFoundError(); return assignment; }
  private mapAssignment(item: any): AssignmentDto { return { id: item.id, courseId: item.courseId, lessonId: item.lessonId, createdById: item.createdById, title: item.title, description: item.description, instructions: item.instructions, status: item.status, dueAt: item.dueAt?.toISOString() ?? null, maxScore: item.maxScore, submissionCount: item._count?.submissions ?? 0, rubricCount: item._count?.rubrics ?? 0, deletedAt: item.deletedAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; }
  private mapSubmission(item: any): SubmissionDto { return { id: item.id, assignmentId: item.assignmentId, userId: item.userId, content: item.content, status: item.status, submittedAt: item.submittedAt.toISOString(), files: item.files.map((file: any) => ({ id: file.id, submissionId: file.submissionId, fileName: file.fileName, fileUrl: file.fileUrl, fileType: file.fileType, fileSize: file.fileSize, createdAt: file.createdAt.toISOString(), updatedAt: file.updatedAt.toISOString() })), grade: item.grade ? this.mapGrade(item.grade) : null, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; }
  private mapGrade(item: any): GradeDto { return { id: item.id, submissionId: item.submissionId, studentId: item.studentId, graderId: item.graderId, score: item.score, maxScore: item.maxScore, feedback: item.feedback, gradedAt: item.gradedAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; }
  private mapRubric(item: any): RubricDto { return { id: item.id, assignmentId: item.assignmentId, title: item.title, description: item.description, maxScore: item.maxScore, sortOrder: item.sortOrder, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; }
  private mapTemplate(item: any): CertificateTemplateDto { return { id: item.id, name: item.name, content: item.content, isDefault: item.isDefault, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; }
  private mapCertificate(item: any): CertificateDto { return { id: item.id, courseId: item.courseId, userId: item.userId, templateId: item.templateId, certificateNumber: item.certificateNumber, issuedAt: item.issuedAt.toISOString(), expiresAt: item.expiresAt?.toISOString() ?? null, revokedAt: item.revokedAt?.toISOString() ?? null, verificationCode: item.verification?.verificationCode ?? null, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; }
}
