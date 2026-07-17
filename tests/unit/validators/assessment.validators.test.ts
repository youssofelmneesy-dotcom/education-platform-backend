import { describe, expect, it } from "vitest";

import {
  answerIdParamsSchema,
  assignQuestionSchema,
  attemptIdParamsSchema,
  createExamSchema,
  examListQuerySchema,
  gradeAnswerParamsSchema,
  idParamsSchema,
  manualGradeAnswerSchema,
  poolIdParamsSchema,
  reorderExamQuestionsSchema,
  saveAnswerSchema,
  updateExamSchema,
} from "../../../src/modules/assessments/validators/index.js";

const uuid = "11111111-1111-4111-8111-111111111111";

describe("assessment validators", () => {
  it("validates exam params", () => {
    expect(idParamsSchema.safeParse({ id: uuid }).success).toBe(true);
    expect(attemptIdParamsSchema.safeParse({ attemptId: uuid }).success).toBe(true);
    expect(poolIdParamsSchema.safeParse({ id: uuid, poolId: uuid }).success).toBe(true);
    expect(answerIdParamsSchema.safeParse({ attemptId: uuid, answerId: uuid }).success).toBe(true);
    expect(gradeAnswerParamsSchema.safeParse({ answerId: uuid }).success).toBe(true);
    expect(idParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);
  });

  it("validates create exam payloads", () => {
    const result = createExamSchema.safeParse({
      courseId: uuid,
      lessonId: uuid,
      questionBankId: uuid,
      title: "Midterm",
      description: "Exam description",
      status: "published",
      timeLimitMinutes: 30,
      passingScore: 1,
      maxAttempts: 2,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 60_000).toISOString(),
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid create exam payloads", () => {
    expect(createExamSchema.safeParse({ courseId: "bad-id", title: "" }).success).toBe(false);
    expect(createExamSchema.safeParse({ courseId: uuid, title: "x".repeat(201) }).success).toBe(false);
    expect(createExamSchema.safeParse({ courseId: uuid, title: "Exam", timeLimitMinutes: 0 }).success).toBe(false);
    expect(createExamSchema.safeParse({ courseId: uuid, title: "Exam", passingScore: -1 }).success).toBe(false);
  });

  it("validates partial update exam payloads", () => {
    expect(updateExamSchema.safeParse({ title: "Updated exam" }).success).toBe(true);
    expect(updateExamSchema.safeParse({ endsAt: "not-a-date" }).success).toBe(false);
  });

  it("coerces and defaults exam list query values", () => {
    const result = examListQuerySchema.parse({ page: "2", limit: "25", includeDeleted: "true", sortBy: "title", sortOrder: "asc" });

    expect(result).toMatchObject({ page: 2, limit: 25, includeDeleted: true, sortBy: "title", sortOrder: "asc" });
  });

  it("rejects invalid exam list query values", () => {
    expect(examListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(examListQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
    expect(examListQuerySchema.safeParse({ sortBy: "unknown" }).success).toBe(false);
  });

  it("validates question assignment and ordering payloads", () => {
    expect(assignQuestionSchema.safeParse({ questionId: uuid, points: 1, sortOrder: 0 }).success).toBe(true);
    expect(assignQuestionSchema.safeParse({ questionId: uuid, points: -1 }).success).toBe(false);
    expect(reorderExamQuestionsSchema.safeParse({ questions: [{ poolId: uuid, sortOrder: 1 }] }).success).toBe(true);
    expect(reorderExamQuestionsSchema.safeParse({ questions: [] }).success).toBe(false);
  });

  it("validates answer and grading payloads", () => {
    expect(saveAnswerSchema.safeParse({ questionId: uuid, answerText: "Answer", selectedChoiceIds: [uuid] }).success).toBe(true);
    expect(saveAnswerSchema.safeParse({ questionId: "bad-id", selectedChoiceIds: ["bad-id"] }).success).toBe(false);
    expect(manualGradeAnswerSchema.safeParse({ isCorrect: true, pointsAwarded: 2 }).success).toBe(true);
    expect(manualGradeAnswerSchema.safeParse({ pointsAwarded: -1 }).success).toBe(false);
  });
});
