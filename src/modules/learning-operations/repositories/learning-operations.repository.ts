import { prisma } from "../../../database/index.js";
import type {
  AssignmentListQueryDto,
  CertificateListQueryDto,
  CreateAssignmentDto,
  CreateCertificateTemplateDto,
  CreateRubricDto,
  CreateSubmissionDto,
  GenerateCertificateDto,
  GradeSubmissionDto,
  UpdateAssignmentDto,
  UpdateCertificateTemplateDto,
  UpdateRubricDto,
  UpdateSubmissionDto,
} from "../dto/index.js";
import type { ILearningOperationsRepository } from "../interfaces/index.js";

const assignmentInclude = { _count: { select: { submissions: true, rubrics: true } } };
const fileSelect = { id: true, submissionId: true, fileName: true, fileUrl: true, fileType: true, fileSize: true, createdAt: true, updatedAt: true };
const gradeSelect = { id: true, submissionId: true, studentId: true, graderId: true, score: true, maxScore: true, feedback: true, gradedAt: true, createdAt: true, updatedAt: true };
const submissionInclude = {
  files: { where: { deletedAt: null }, select: fileSelect, orderBy: { createdAt: "asc" as const } },
  grade: { select: gradeSelect },
};
const certificateInclude = { verification: { select: { verificationCode: true } } };
const templateSelect = { id: true, name: true, content: true, isDefault: true, createdAt: true, updatedAt: true };
const rubricSelect = { id: true, assignmentId: true, title: true, description: true, maxScore: true, sortOrder: true, createdAt: true, updatedAt: true };

export class LearningOperationsRepository implements ILearningOperationsRepository {
  async relatedAssignmentResourcesExist(tenantId: string, data: { courseId?: string; lessonId?: string | null }): Promise<boolean> {
    const [course, lesson] = await Promise.all([
      data.courseId ? prisma.course.count({ where: { id: data.courseId, tenantId, deletedAt: null } }) : 1,
      data.lessonId ? prisma.lesson.count({ where: { id: data.lessonId, tenantId, deletedAt: null } }) : 1,
    ]);
    return course > 0 && lesson > 0;
  }

  async certificateResourcesExist(tenantId: string, data: { courseId?: string; userId?: string; templateId?: string | null }): Promise<boolean> {
    const [course, user, template] = await Promise.all([
      data.courseId ? prisma.course.count({ where: { id: data.courseId, tenantId, deletedAt: null } }) : 1,
      data.userId ? prisma.user.count({ where: { id: data.userId, tenantId, deletedAt: null } }) : 1,
      data.templateId ? prisma.certificateTemplate.count({ where: { id: data.templateId, tenantId, deletedAt: null } }) : 1,
    ]);
    return course > 0 && user > 0 && template > 0;
  }

  async createAssignment(tenantId: string, createdById: string | null, data: CreateAssignmentDto) {
    return prisma.assignment.create({
      data: {
        tenantId,
        createdById,
        courseId: data.courseId,
        lessonId: data.lessonId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        status: data.status,
        dueAt: data.dueAt ? new Date(data.dueAt) : data.dueAt,
        maxScore: data.maxScore,
      },
      include: assignmentInclude,
    });
  }

  async listAssignments(tenantId: string, query: AssignmentListQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      tenantId,
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.search ? { OR: [{ title: { contains: query.search, mode: "insensitive" as const } }, { description: { contains: query.search, mode: "insensitive" as const } }] } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.lessonId ? { lessonId: query.lessonId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({ where, include: assignmentInclude, orderBy: { [query.sortBy]: query.sortOrder }, skip, take: query.limit }),
      prisma.assignment.count({ where }),
    ]);
    return { assignments, total };
  }

  async findAssignmentById(id: string, tenantId: string, includeDeleted = false) {
    return prisma.assignment.findFirst({ where: { id, tenantId, ...(includeDeleted ? {} : { deletedAt: null }) }, include: assignmentInclude });
  }

  async updateAssignment(id: string, tenantId: string, data: UpdateAssignmentDto) {
    if (!(await this.findAssignmentById(id, tenantId))) return null;
    return prisma.assignment.update({
      where: { tenantId_id: { tenantId, id } },
      data: {
        courseId: data.courseId,
        lessonId: data.lessonId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        status: data.status,
        dueAt: data.dueAt ? new Date(data.dueAt) : data.dueAt,
        maxScore: data.maxScore,
      },
      include: assignmentInclude,
    });
  }

  async softDeleteAssignment(id: string, tenantId: string): Promise<boolean> {
    const result = await prisma.assignment.updateMany({ where: { id, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
    return result.count > 0;
  }

  async restoreAssignment(id: string, tenantId: string) {
    const result = await prisma.assignment.updateMany({ where: { id, tenantId, deletedAt: { not: null } }, data: { deletedAt: null } });
    return result.count ? this.findAssignmentById(id, tenantId) : null;
  }

  async createSubmission(assignmentId: string, userId: string, tenantId: string, data: CreateSubmissionDto) {
    return prisma.submission.create({
      data: { tenantId, assignmentId, userId, content: data.content, files: data.files?.length ? { create: data.files.map((file) => ({ tenantId, ...file })) } : undefined },
      include: submissionInclude,
    });
  }

  async updateSubmission(submissionId: string, userId: string | null, tenantId: string, data: UpdateSubmissionDto) {
    const submission = await prisma.submission.findFirst({ where: { id: submissionId, tenantId, deletedAt: null, ...(userId ? { userId } : {}) }, select: { id: true } });
    if (!submission) return null;
    return prisma.$transaction(async (transaction) => {
      if (data.files) {
        await transaction.submissionFile.updateMany({ where: { submissionId, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
        if (data.files.length) await transaction.submissionFile.createMany({ data: data.files.map((file) => ({ tenantId, submissionId, ...file })) });
      }
      return transaction.submission.update({ where: { id: submission.id }, data: { content: data.content, status: data.status }, include: submissionInclude });
    });
  }

  async submitSubmission(submissionId: string, userId: string, tenantId: string) {
    const submission = await prisma.submission.findFirst({ where: { id: submissionId, tenantId, userId, deletedAt: null }, select: { id: true } });
    if (!submission) return null;
    return prisma.submission.update({ where: { id: submission.id }, data: { status: "submitted", submittedAt: new Date() }, include: submissionInclude });
  }

  async findSubmissionById(submissionId: string, userId: string | null, tenantId: string) {
    return prisma.submission.findFirst({ where: { id: submissionId, tenantId, deletedAt: null, ...(userId ? { userId } : {}) }, include: submissionInclude });
  }

  async listMySubmissions(userId: string, tenantId: string) {
    return prisma.submission.findMany({ where: { userId, tenantId, deletedAt: null }, include: submissionInclude, orderBy: { submittedAt: "desc" } });
  }

  async listAssignmentSubmissions(assignmentId: string, tenantId: string) {
    return prisma.submission.findMany({ where: { assignmentId, tenantId, deletedAt: null }, include: submissionInclude, orderBy: { submittedAt: "desc" } });
  }

  async gradeSubmission(submissionId: string, graderId: string | null, tenantId: string, data: GradeSubmissionDto) {
    const submission = await prisma.submission.findFirst({ where: { id: submissionId, tenantId, deletedAt: null }, select: { id: true, userId: true } });
    if (!submission) return null;
    return prisma.grade.upsert({
      where: { tenantId_submissionId: { tenantId, submissionId } },
      update: { graderId, score: data.score, maxScore: data.maxScore, feedback: data.feedback, gradedAt: new Date() },
      create: { tenantId, submissionId, studentId: submission.userId, graderId, score: data.score, maxScore: data.maxScore, feedback: data.feedback, gradedAt: new Date() },
      select: gradeSelect,
    });
  }

  async createRubric(assignmentId: string, tenantId: string, data: CreateRubricDto) {
    return prisma.rubric.create({ data: { tenantId, assignmentId, ...data }, select: rubricSelect });
  }

  async listRubrics(assignmentId: string, tenantId: string) {
    return prisma.rubric.findMany({ where: { assignmentId, tenantId, deletedAt: null }, select: rubricSelect, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  }

  async updateRubric(assignmentId: string, rubricId: string, tenantId: string, data: UpdateRubricDto) {
    const rubric = await prisma.rubric.findFirst({ where: { id: rubricId, assignmentId, tenantId, deletedAt: null }, select: { id: true } });
    if (!rubric) return null;
    return prisma.rubric.update({ where: { id: rubric.id }, data, select: rubricSelect });
  }

  async deleteRubric(assignmentId: string, rubricId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.rubric.updateMany({ where: { id: rubricId, assignmentId, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
    return result.count > 0;
  }

  async createTemplate(tenantId: string, data: CreateCertificateTemplateDto) {
    return prisma.$transaction(async (transaction) => {
      if (data.isDefault) await transaction.certificateTemplate.updateMany({ where: { tenantId, deletedAt: null }, data: { isDefault: false } });
      return transaction.certificateTemplate.create({ data: { tenantId, ...data }, select: templateSelect });
    });
  }

  async listTemplates(tenantId: string) {
    return prisma.certificateTemplate.findMany({ where: { tenantId, deletedAt: null }, select: templateSelect, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  }

  async updateTemplate(id: string, tenantId: string, data: UpdateCertificateTemplateDto) {
    const template = await prisma.certificateTemplate.findFirst({ where: { id, tenantId, deletedAt: null }, select: { id: true } });
    if (!template) return null;
    return prisma.$transaction(async (transaction) => {
      if (data.isDefault) await transaction.certificateTemplate.updateMany({ where: { tenantId, deletedAt: null, id: { not: template.id } }, data: { isDefault: false } });
      return transaction.certificateTemplate.update({ where: { id: template.id }, data, select: templateSelect });
    });
  }

  async deleteTemplate(id: string, tenantId: string): Promise<boolean> {
    const result = await prisma.certificateTemplate.updateMany({ where: { id, tenantId, deletedAt: null }, data: { deletedAt: new Date(), isDefault: false } });
    return result.count > 0;
  }

  async generateCertificate(tenantId: string, certificateNumber: string, verificationCode: string, data: GenerateCertificateDto) {
    return prisma.$transaction(async (transaction) => {
      const certificate = await transaction.certificate.upsert({
        where: { tenantId_courseId_userId: { tenantId, courseId: data.courseId, userId: data.userId } },
        update: { templateId: data.templateId, expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt, revokedAt: null },
        create: { tenantId, courseId: data.courseId, userId: data.userId, templateId: data.templateId, certificateNumber, expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt },
        include: certificateInclude,
      });
      await transaction.certificateVerification.upsert({
        where: { tenantId_certificateId: { tenantId, certificateId: certificate.id } },
        update: { deletedAt: null },
        create: { tenantId, certificateId: certificate.id, verificationCode },
      });
      return transaction.certificate.findUnique({ where: { tenantId_id: { tenantId, id: certificate.id } }, include: certificateInclude });
    });
  }

  async findCertificateByNumber(certificateNumber: string, tenantId?: string) {
    return prisma.certificate.findFirst({ where: { certificateNumber, ...(tenantId ? { tenantId } : {}), deletedAt: null }, include: certificateInclude });
  }

  async listCertificates(tenantId: string, query: CertificateListQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = { tenantId, deletedAt: null, ...(query.includeRevoked ? {} : { revokedAt: null }), ...(query.courseId ? { courseId: query.courseId } : {}), ...(query.userId ? { userId: query.userId } : {}), ...(query.templateId ? { templateId: query.templateId } : {}) };
    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({ where, include: certificateInclude, orderBy: { issuedAt: "desc" }, skip, take: query.limit }),
      prisma.certificate.count({ where }),
    ]);
    return { certificates, total };
  }

  async revokeCertificate(id: string, tenantId: string) {
    const certificate = await prisma.certificate.findFirst({ where: { id, tenantId, deletedAt: null }, select: { id: true } });
    if (!certificate) return null;
    return prisma.certificate.update({ where: { id: certificate.id }, data: { revokedAt: new Date() }, include: certificateInclude });
  }

  async verifyCertificate(verificationCode: string) {
    const verification = await prisma.certificateVerification.update({
      where: { verificationCode },
      data: { verifiedAt: new Date() },
      include: { certificate: { include: certificateInclude } },
    });
    return verification.certificate;
  }

  async getStatistics(tenantId: string) {
    const [assignmentGroups, totalAssignments, submissionGroups, totalSubmissions, gradeAgg, totalCertificates, revokedCertificates, totalTemplates] = await Promise.all([
      prisma.assignment.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.assignment.count({ where: { tenantId, deletedAt: null } }),
      prisma.submission.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.submission.count({ where: { tenantId, deletedAt: null } }),
      prisma.grade.aggregate({ where: { tenantId, deletedAt: null }, _count: { id: true }, _avg: { score: true } }),
      prisma.certificate.count({ where: { tenantId, deletedAt: null } }),
      prisma.certificate.count({ where: { tenantId, deletedAt: null, revokedAt: { not: null } } }),
      prisma.certificateTemplate.count({ where: { tenantId, deletedAt: null } }),
    ]);
    return { totalAssignments, assignmentsByStatus: assignmentGroups.map((g) => ({ status: g.status, count: g._count.id })), totalSubmissions, submissionsByStatus: submissionGroups.map((g) => ({ status: g.status, count: g._count.id })), totalGrades: gradeAgg._count.id, averageGradeScore: Math.round(gradeAgg._avg.score ?? 0), totalCertificates, revokedCertificates, totalTemplates };
  }
}
