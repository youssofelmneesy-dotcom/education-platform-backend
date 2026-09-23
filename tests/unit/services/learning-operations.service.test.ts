import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearningOperationsService } from "../../../src/modules/learning-operations/services/index.js";
import type { ILearningOperationsRepository } from "../../../src/modules/learning-operations/interfaces/index.js";
import {
  AssignmentNotFoundError,
  CertificateNotFoundError,
  CertificateTemplateNotFoundError,
  CertificateVerificationNotFoundError,
  RelatedLearningResourceNotFoundError,
  RubricNotFoundError,
  SubmissionNotFoundError,
} from "../../../src/modules/learning-operations/utils/index.js";

const tenantId = "tenant-id";
const userId = "user-id";
const assignmentId = "assignment-id";
const submissionId = "submission-id";
const rubricId = "rubric-id";
const templateId = "template-id";
const certificateId = "certificate-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function assignment(overrides: Record<string, unknown> = {}) {
  return {
    id: assignmentId,
    courseId: "course-id",
    lessonId: null,
    createdById: userId,
    title: "Assignment",
    description: null,
    instructions: null,
    status: "draft",
    dueAt: null,
    maxScore: 100,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    _count: { submissions: 1, rubrics: 1 },
    ...overrides,
  };
}

function grade(overrides: Record<string, unknown> = {}) {
  return { id: "grade-id", submissionId, studentId: userId, graderId: "grader-id", score: 90, maxScore: 100, feedback: "Good", gradedAt: now, createdAt: now, updatedAt: now, ...overrides };
}

function submission(overrides: Record<string, unknown> = {}) {
  return {
    id: submissionId,
    assignmentId,
    userId,
    content: "Answer",
    status: "draft",
    submittedAt: now,
    files: [{ id: "file-id", submissionId, fileName: "a.pdf", fileUrl: "https://example.com/a.pdf", fileType: "pdf", fileSize: 10, createdAt: now, updatedAt: now }],
    grade: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function rubric(overrides: Record<string, unknown> = {}) {
  return { id: rubricId, assignmentId, title: "Quality", description: null, maxScore: 10, sortOrder: 0, createdAt: now, updatedAt: now, ...overrides };
}

function template(overrides: Record<string, unknown> = {}) {
  return { id: templateId, name: "Default", content: "Template", isDefault: true, createdAt: now, updatedAt: now, ...overrides };
}

function certificate(overrides: Record<string, unknown> = {}) {
  return {
    id: certificateId,
    courseId: "course-id",
    userId,
    templateId,
    certificateNumber: "CERT-1",
    issuedAt: now,
    expiresAt: null,
    revokedAt: null,
    verification: { verificationCode: "VERIFY-1" },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createRepo(): ILearningOperationsRepository {
  return {
    relatedAssignmentResourcesExist: vi.fn().mockResolvedValue(true),
    certificateResourcesExist: vi.fn().mockResolvedValue(true),
    createAssignment: vi.fn().mockResolvedValue(assignment()),
    listAssignments: vi.fn().mockResolvedValue({ assignments: [assignment()], total: 1 }),
    findAssignmentById: vi.fn().mockResolvedValue(assignment()),
    updateAssignment: vi.fn().mockResolvedValue(assignment({ title: "Updated" })),
    softDeleteAssignment: vi.fn().mockResolvedValue(true),
    restoreAssignment: vi.fn().mockResolvedValue(assignment()),
    createSubmission: vi.fn().mockResolvedValue(submission()),
    updateSubmission: vi.fn().mockResolvedValue(submission({ content: "Updated" })),
    submitSubmission: vi.fn().mockResolvedValue(submission({ status: "submitted" })),
    findSubmissionById: vi.fn().mockResolvedValue(submission()),
    listMySubmissions: vi.fn().mockResolvedValue([submission()]),
    listAssignmentSubmissions: vi.fn().mockResolvedValue([submission()]),
    gradeSubmission: vi.fn().mockResolvedValue(grade()),
    createRubric: vi.fn().mockResolvedValue(rubric()),
    listRubrics: vi.fn().mockResolvedValue([rubric()]),
    updateRubric: vi.fn().mockResolvedValue(rubric({ title: "Updated rubric" })),
    deleteRubric: vi.fn().mockResolvedValue(true),
    createTemplate: vi.fn().mockResolvedValue(template()),
    listTemplates: vi.fn().mockResolvedValue([template()]),
    updateTemplate: vi.fn().mockResolvedValue(template({ name: "Updated template" })),
    deleteTemplate: vi.fn().mockResolvedValue(true),
    generateCertificate: vi.fn().mockResolvedValue(certificate()),
    findCertificateByNumber: vi.fn().mockResolvedValue(certificate()),
    listCertificates: vi.fn().mockResolvedValue({ certificates: [certificate()], total: 1 }),
    revokeCertificate: vi.fn().mockResolvedValue(certificate({ revokedAt: now })),
    verifyCertificate: vi.fn().mockResolvedValue(certificate()),
    getStatistics: vi.fn().mockResolvedValue({
      totalAssignments: 1,
      assignmentsByStatus: [{ status: "draft", count: 1 }],
      totalSubmissions: 1,
      submissionsByStatus: [{ status: "draft", count: 1 }],
      totalGrades: 1,
      averageGradeScore: 90,
      totalCertificates: 1,
      revokedCertificates: 0,
      totalTemplates: 1,
    }),
  };
}

describe("LearningOperationsService", () => {
  let repo: ILearningOperationsRepository;
  let service: LearningOperationsService;

  beforeEach(() => {
    repo = createRepo();
    service = new LearningOperationsService(repo);
  });

  it("creates, lists, reads, updates, deletes, and restores assignments", async () => {
    await expect(service.createAssignment(tenantId, userId, { courseId: "course-id", title: "Assignment" })).resolves.toMatchObject({ id: assignmentId, submissionCount: 1 });
    await expect(service.listAssignments(tenantId, { page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" })).resolves.toMatchObject({ total: 1, page: 1 });
    await expect(service.getAssignment(assignmentId, tenantId)).resolves.toMatchObject({ id: assignmentId });
    await expect(service.updateAssignment(assignmentId, tenantId, { title: "Updated" })).resolves.toMatchObject({ title: "Updated" });
    await expect(service.deleteAssignment(assignmentId, tenantId)).resolves.toBeUndefined();
    await expect(service.restoreAssignment(assignmentId, tenantId)).resolves.toMatchObject({ id: assignmentId });
  });

  it("throws assignment errors", async () => {
    vi.mocked(repo.relatedAssignmentResourcesExist).mockResolvedValueOnce(false);
    await expect(service.createAssignment(tenantId, userId, { courseId: "missing", title: "Assignment" })).rejects.toBeInstanceOf(RelatedLearningResourceNotFoundError);

    vi.mocked(repo.findAssignmentById).mockResolvedValueOnce(null);
    await expect(service.getAssignment(assignmentId, tenantId)).rejects.toBeInstanceOf(AssignmentNotFoundError);

    vi.mocked(repo.softDeleteAssignment).mockResolvedValueOnce(false);
    await expect(service.deleteAssignment(assignmentId, tenantId)).rejects.toBeInstanceOf(AssignmentNotFoundError);
  });

  it("handles submissions and grading", async () => {
    await expect(service.createSubmission(assignmentId, userId, tenantId, { content: "Answer" })).resolves.toMatchObject({ id: submissionId, files: [{ fileName: "a.pdf" }] });
    await expect(service.updateSubmission(submissionId, userId, tenantId, { content: "Updated" })).resolves.toMatchObject({ content: "Updated" });
    await expect(service.submitSubmission(submissionId, userId, tenantId)).resolves.toMatchObject({ status: "submitted" });
    await expect(service.getSubmission(submissionId, userId, tenantId)).resolves.toMatchObject({ id: submissionId });
    await expect(service.listMySubmissions(userId, tenantId)).resolves.toHaveLength(1);
    await expect(service.listAssignmentSubmissions(assignmentId, tenantId)).resolves.toHaveLength(1);
    await expect(service.gradeSubmission(submissionId, "grader-id", tenantId, { score: 90, maxScore: 100 })).resolves.toMatchObject({ score: 90 });
  });

  it("throws submission errors", async () => {
    vi.mocked(repo.updateSubmission).mockResolvedValueOnce(null);
    await expect(service.updateSubmission(submissionId, userId, tenantId, {})).rejects.toBeInstanceOf(SubmissionNotFoundError);

    vi.mocked(repo.gradeSubmission).mockResolvedValueOnce(null);
    await expect(service.gradeSubmission(submissionId, "grader-id", tenantId, { score: 0, maxScore: 100 })).rejects.toBeInstanceOf(SubmissionNotFoundError);
  });

  it("handles rubrics", async () => {
    await expect(service.createRubric(assignmentId, tenantId, { title: "Quality", maxScore: 10 })).resolves.toMatchObject({ id: rubricId });
    await expect(service.listRubrics(assignmentId, tenantId)).resolves.toHaveLength(1);
    await expect(service.updateRubric(assignmentId, rubricId, tenantId, { title: "Updated rubric" })).resolves.toMatchObject({ title: "Updated rubric" });
    await expect(service.deleteRubric(assignmentId, rubricId, tenantId)).resolves.toBeUndefined();

    vi.mocked(repo.updateRubric).mockResolvedValueOnce(null);
    await expect(service.updateRubric(assignmentId, "missing", tenantId, {})).rejects.toBeInstanceOf(RubricNotFoundError);
  });

  it("handles templates and certificates", async () => {
    await expect(service.createTemplate(tenantId, { name: "Default", content: "Template" })).resolves.toMatchObject({ id: templateId });
    await expect(service.listTemplates(tenantId)).resolves.toHaveLength(1);
    await expect(service.updateTemplate(templateId, tenantId, { name: "Updated template" })).resolves.toMatchObject({ name: "Updated template" });
    await expect(service.deleteTemplate(templateId, tenantId)).resolves.toBeUndefined();
    await expect(service.generateCertificate(tenantId, { courseId: "course-id", userId, templateId })).resolves.toMatchObject({ id: certificateId, verificationCode: "VERIFY-1" });
    await expect(service.getCertificate("CERT-1", tenantId)).resolves.toMatchObject({ certificateNumber: "CERT-1" });
    await expect(service.verifyCertificate("VERIFY-1")).resolves.toMatchObject({ verificationCode: "VERIFY-1" });
    await expect(service.listCertificates(tenantId, { page: 1, limit: 10 })).resolves.toMatchObject({ total: 1 });
    await expect(service.revokeCertificate(certificateId, tenantId)).resolves.toMatchObject({ revokedAt: now.toISOString() });
  });

  it("throws template and certificate errors", async () => {
    vi.mocked(repo.updateTemplate).mockResolvedValueOnce(null);
    await expect(service.updateTemplate("missing", tenantId, {})).rejects.toBeInstanceOf(CertificateTemplateNotFoundError);

    vi.mocked(repo.certificateResourcesExist).mockResolvedValueOnce(false);
    await expect(service.generateCertificate(tenantId, { courseId: "missing", userId })).rejects.toBeInstanceOf(RelatedLearningResourceNotFoundError);

    vi.mocked(repo.findCertificateByNumber).mockResolvedValueOnce(null);
    await expect(service.getCertificate("missing", tenantId)).rejects.toBeInstanceOf(CertificateNotFoundError);

    vi.mocked(repo.verifyCertificate).mockRejectedValueOnce(new Error("missing"));
    await expect(service.verifyCertificate("missing")).rejects.toBeInstanceOf(CertificateVerificationNotFoundError);
  });

  it("returns statistics", async () => {
    await expect(service.getStatistics(tenantId)).resolves.toMatchObject({ totalAssignments: 1, averageGradeScore: 90 });
  });
});
