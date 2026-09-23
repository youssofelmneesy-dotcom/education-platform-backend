import { describe, expect, it } from "vitest";

import {
  assignmentIdParamsSchema,
  assignmentListQuerySchema,
  certificateListQuerySchema,
  certificateNumberParamsSchema,
  createAssignmentSchema,
  createCertificateTemplateSchema,
  createRubricSchema,
  createSubmissionSchema,
  generateCertificateSchema,
  gradeSubmissionSchema,
  idParamsSchema,
  updateAssignmentSchema,
  updateCertificateTemplateSchema,
  updateRubricSchema,
  updateSubmissionSchema,
  verificationCodeParamsSchema,
} from "../../../src/modules/learning-operations/validators/index.js";

const uuid = "11111111-1111-4111-8111-111111111111";
const iso = new Date("2026-01-01T00:00:00.000Z").toISOString();

describe("learning operations validators", () => {
  it("validates route params", () => {
    expect(idParamsSchema.safeParse({ id: uuid }).success).toBe(true);
    expect(assignmentIdParamsSchema.safeParse({ assignmentId: uuid }).success).toBe(true);
    expect(certificateNumberParamsSchema.safeParse({ certificateNumber: "CERT-1" }).success).toBe(true);
    expect(verificationCodeParamsSchema.safeParse({ verificationCode: "VERIFY-1" }).success).toBe(true);
    expect(idParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);
  });

  it("validates assignment payloads and queries", () => {
    expect(createAssignmentSchema.safeParse({ courseId: uuid, lessonId: uuid, title: "Essay", dueAt: iso, maxScore: 100 }).success).toBe(true);
    expect(createAssignmentSchema.safeParse({ courseId: "bad-id", title: "" }).success).toBe(false);
    expect(updateAssignmentSchema.safeParse({ title: "Updated" }).success).toBe(true);
    expect(updateAssignmentSchema.safeParse({ dueAt: "bad-date" }).success).toBe(false);

    const query = assignmentListQuerySchema.parse({ page: "2", limit: "25", includeDeleted: "true", sortBy: "title", sortOrder: "asc" });
    expect(query).toMatchObject({ page: 2, limit: 25, includeDeleted: true, sortBy: "title", sortOrder: "asc" });
  });

  it("validates submission and grading payloads", () => {
    expect(createSubmissionSchema.safeParse({ content: "Answer", files: [{ fileName: "a.pdf", fileUrl: "https://example.com/a.pdf", fileSize: 10 }] }).success).toBe(true);
    expect(createSubmissionSchema.safeParse({ files: [{ fileName: "", fileUrl: "not-url" }] }).success).toBe(false);
    expect(updateSubmissionSchema.safeParse({ status: "draft", files: [] }).success).toBe(true);
    expect(gradeSubmissionSchema.safeParse({ score: 90, maxScore: 100, feedback: "Good" }).success).toBe(true);
    expect(gradeSubmissionSchema.safeParse({ score: -1, maxScore: 100 }).success).toBe(false);
  });

  it("validates rubrics and certificate templates", () => {
    expect(createRubricSchema.safeParse({ title: "Quality", maxScore: 10, sortOrder: 0 }).success).toBe(true);
    expect(createRubricSchema.safeParse({ title: "", maxScore: -1 }).success).toBe(false);
    expect(updateRubricSchema.safeParse({ description: null }).success).toBe(true);
    expect(createCertificateTemplateSchema.safeParse({ name: "Default", content: "Template", isDefault: true }).success).toBe(true);
    expect(createCertificateTemplateSchema.safeParse({ name: "", content: "" }).success).toBe(false);
    expect(updateCertificateTemplateSchema.safeParse({ isDefault: false }).success).toBe(true);
  });

  it("validates certificate generation and list queries", () => {
    expect(generateCertificateSchema.safeParse({ courseId: uuid, userId: uuid, templateId: uuid, expiresAt: iso }).success).toBe(true);
    expect(generateCertificateSchema.safeParse({ courseId: uuid, userId: "bad-id" }).success).toBe(false);

    const query = certificateListQuerySchema.parse({ page: "1", limit: "10", includeRevoked: "true", courseId: uuid });
    expect(query).toMatchObject({ page: 1, limit: 10, includeRevoked: true, courseId: uuid });
  });
});
