import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssessmentService } from "../../../src/modules/assessments/services/index.js";
import type { IAssessmentRepository } from "../../../src/modules/assessments/interfaces/index.js";
import type { AttemptReviewRecord, ExamAttemptRecord, ExamQuestionRecord, ExamRecord, ExamResultRecord, StudentAnswerRecord } from "../../../src/modules/assessments/types/index.js";
import {
  ActiveAttemptExistsError,
  AttemptNotActiveError,
  ExamAttemptNotFoundError,
  ExamNotFoundError,
  ExamQuestionNotFoundError,
  ExamResultNotFoundError,
  ExamUnavailableError,
  MaxAttemptsReachedError,
  QuestionNotFoundError,
  RelatedAssessmentResourceNotFoundError,
  StudentAnswerNotFoundError,
} from "../../../src/modules/assessments/utils/index.js";

const tenantId = "tenant-id";
const userId = "user-id";
const examId = "exam-id";
const questionId = "question-id";
const poolId = "pool-id";
const attemptId = "attempt-id";
const answerId = "answer-id";
const now = new Date("2026-01-01T00:00:00.000Z");

function examRecord(overrides: Partial<ExamRecord> = {}): ExamRecord {
  return {
    id: examId,
    courseId: "course-id",
    lessonId: null,
    questionBankId: null,
    title: "Exam",
    description: null,
    status: "published",
    timeLimitMinutes: null,
    passingScore: 1,
    maxAttempts: 2,
    startsAt: null,
    endsAt: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    questionPools: [{ points: 2 }],
    ...overrides,
  };
}

function examQuestionRecord(overrides: Partial<ExamQuestionRecord> = {}): ExamQuestionRecord {
  return {
    id: poolId,
    examId,
    questionId,
    points: 2,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    question: {
      id: questionId,
      prompt: "Prompt",
      type: "single_choice",
      choices: [
        { id: "choice-a", content: "A", isCorrect: true, sortOrder: 0 },
        { id: "choice-b", content: "B", isCorrect: false, sortOrder: 1 },
      ],
    },
    ...overrides,
  };
}

function attemptRecord(overrides: Partial<ExamAttemptRecord> = {}): ExamAttemptRecord {
  return {
    id: attemptId,
    examId,
    userId,
    attemptNumber: 1,
    status: "in_progress",
    startedAt: now,
    submittedAt: null,
    score: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function answerRecord(overrides: Partial<StudentAnswerRecord> = {}): StudentAnswerRecord {
  return {
    id: answerId,
    examAttemptId: attemptId,
    questionId,
    userId,
    answerText: null,
    selectedChoiceIds: ["choice-a"],
    isCorrect: null,
    pointsAwarded: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function resultRecord(overrides: Partial<ExamResultRecord> = {}): ExamResultRecord {
  return {
    id: "result-id",
    examId,
    examAttemptId: attemptId,
    userId,
    score: 2,
    maxScore: 2,
    passed: true,
    gradedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function attemptReview(overrides: Partial<AttemptReviewRecord> = {}): AttemptReviewRecord {
  return { attempt: attemptRecord(), result: null, answers: [answerRecord()], ...overrides };
}

function createRepositoryMock(): IAssessmentRepository {
  return {
    relatedResourcesExist: vi.fn().mockResolvedValue(true),
    createExam: vi.fn().mockResolvedValue(examRecord()),
    listExams: vi.fn().mockResolvedValue({ exams: [examRecord()], total: 1 }),
    findExamById: vi.fn().mockResolvedValue(examRecord()),
    updateExam: vi.fn().mockResolvedValue(examRecord({ title: "Updated" })),
    softDeleteExam: vi.fn().mockResolvedValue(true),
    restoreExam: vi.fn().mockResolvedValue(examRecord()),
    questionExists: vi.fn().mockResolvedValue(true),
    assignQuestion: vi.fn().mockResolvedValue(examQuestionRecord()),
    listExamQuestions: vi.fn().mockResolvedValue([examQuestionRecord()]),
    removeQuestion: vi.fn().mockResolvedValue(true),
    reorderQuestions: vi.fn().mockResolvedValue([examQuestionRecord({ sortOrder: 1 })]),
    findActiveAttempt: vi.fn().mockResolvedValue(null),
    countAttempts: vi.fn().mockResolvedValue(0),
    createAttempt: vi.fn().mockResolvedValue(attemptRecord()),
    findAttemptById: vi.fn().mockResolvedValue(attemptReview()),
    saveAnswer: vi.fn().mockResolvedValue(answerRecord()),
    clearAnswer: vi.fn().mockResolvedValue(true),
    submitAttempt: vi.fn().mockResolvedValue(attemptReview({ attempt: attemptRecord({ status: "submitted", submittedAt: now }) })),
    updateAttemptScore: vi.fn().mockResolvedValue(undefined),
    upsertResult: vi.fn().mockResolvedValue(resultRecord()),
    gradeAnswer: vi.fn().mockResolvedValue(answerRecord({ isCorrect: true, pointsAwarded: 2 })),
    getResult: vi.fn().mockResolvedValue(resultRecord()),
    getStatistics: vi.fn().mockResolvedValue({
      totalExams: 1,
      examsByStatus: [{ status: "published", count: 1 }],
      totalAttempts: 1,
      attemptsByStatus: [{ status: "submitted", count: 1 }],
      totalResults: 1,
      passedResults: 1,
      averageScore: 2,
    }),
  };
}

describe("AssessmentService", () => {
  let repository: IAssessmentRepository;
  let service: AssessmentService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new AssessmentService(repository);
  });

  it("creates an exam after checking related resources", async () => {
    const result = await service.createExam(tenantId, { courseId: "course-id", title: "Exam" });

    expect(repository.relatedResourcesExist).toHaveBeenCalledWith(tenantId, { courseId: "course-id", title: "Exam" });
    expect(repository.createExam).toHaveBeenCalled();
    expect(result).toMatchObject({ id: examId, title: "Exam", questionCount: 1, maxScore: 2 });
  });

  it("rejects exam creation when related resources are missing", async () => {
    vi.mocked(repository.relatedResourcesExist).mockResolvedValue(false);

    await expect(service.createExam(tenantId, { courseId: "missing", title: "Exam" })).rejects.toBeInstanceOf(RelatedAssessmentResourceNotFoundError);
  });

  it("lists exams with pagination metadata", async () => {
    const result = await service.listExams(tenantId, { page: 2, limit: 5, sortBy: "createdAt", sortOrder: "desc" });

    expect(result).toMatchObject({ total: 1, page: 2, limit: 5 });
    expect(result.exams[0]).toMatchObject({ id: examId });
  });

  it("gets, updates, deletes, and restores exams", async () => {
    await expect(service.getExam(examId, tenantId)).resolves.toMatchObject({ id: examId });
    await expect(service.updateExam(examId, tenantId, { title: "Updated" })).resolves.toMatchObject({ title: "Updated" });
    await expect(service.deleteExam(examId, tenantId)).resolves.toBeUndefined();
    await expect(service.restoreExam(examId, tenantId)).resolves.toMatchObject({ id: examId });
  });

  it("throws exam errors for missing exam operations", async () => {
    vi.mocked(repository.findExamById).mockResolvedValue(null);
    vi.mocked(repository.softDeleteExam).mockResolvedValue(false);
    vi.mocked(repository.restoreExam).mockResolvedValue(null);

    await expect(service.getExam(examId, tenantId)).rejects.toBeInstanceOf(ExamNotFoundError);
    await expect(service.deleteExam(examId, tenantId)).rejects.toBeInstanceOf(ExamNotFoundError);
    await expect(service.restoreExam(examId, tenantId)).rejects.toBeInstanceOf(ExamNotFoundError);
  });

  it("assigns, lists, reorders, and removes exam questions", async () => {
    await expect(service.assignQuestion(examId, tenantId, { questionId, points: 2 })).resolves.toMatchObject({ id: poolId, questionId });
    await expect(service.listExamQuestions(examId, tenantId)).resolves.toHaveLength(1);
    await expect(service.reorderQuestions(examId, tenantId, [{ poolId, sortOrder: 1 }])).resolves.toMatchObject([{ sortOrder: 1 }]);
    await expect(service.removeQuestion(examId, poolId, tenantId)).resolves.toBeUndefined();
  });

  it("throws question errors for missing question operations", async () => {
    vi.mocked(repository.questionExists).mockResolvedValue(false);
    await expect(service.assignQuestion(examId, tenantId, { questionId })).rejects.toBeInstanceOf(QuestionNotFoundError);

    vi.mocked(repository.questionExists).mockResolvedValue(true);
    vi.mocked(repository.removeQuestion).mockResolvedValue(false);
    await expect(service.removeQuestion(examId, poolId, tenantId)).rejects.toBeInstanceOf(ExamQuestionNotFoundError);
  });

  it("starts attempts when exams are available", async () => {
    const result = await service.startAttempt(examId, userId, tenantId);

    expect(repository.findActiveAttempt).toHaveBeenCalledWith(examId, userId, tenantId);
    expect(repository.createAttempt).toHaveBeenCalledWith(examId, userId, tenantId, 1);
    expect(result).toMatchObject({ id: attemptId, status: "in_progress" });
  });

  it("rejects unavailable, active, and exhausted attempts", async () => {
    vi.mocked(repository.findExamById).mockResolvedValueOnce(examRecord({ status: "draft" }));
    await expect(service.startAttempt(examId, userId, tenantId)).rejects.toBeInstanceOf(ExamUnavailableError);

    vi.mocked(repository.findExamById).mockResolvedValueOnce(examRecord());
    vi.mocked(repository.findActiveAttempt).mockResolvedValueOnce(attemptRecord());
    await expect(service.startAttempt(examId, userId, tenantId)).rejects.toBeInstanceOf(ActiveAttemptExistsError);

    vi.mocked(repository.findExamById).mockResolvedValueOnce(examRecord({ maxAttempts: 1 }));
    vi.mocked(repository.findActiveAttempt).mockResolvedValueOnce(null);
    vi.mocked(repository.countAttempts).mockResolvedValueOnce(1);
    await expect(service.startAttempt(examId, userId, tenantId)).rejects.toBeInstanceOf(MaxAttemptsReachedError);
  });

  it("resumes active attempts", async () => {
    vi.mocked(repository.findActiveAttempt).mockResolvedValue(attemptRecord());

    await expect(service.resumeAttempt(examId, userId, tenantId)).resolves.toMatchObject({ id: attemptId });
  });

  it("throws when no active attempt can be resumed", async () => {
    vi.mocked(repository.findActiveAttempt).mockResolvedValue(null);

    await expect(service.resumeAttempt(examId, userId, tenantId)).rejects.toBeInstanceOf(ExamAttemptNotFoundError);
  });

  it("saves and clears answers for active attempts", async () => {
    await expect(service.saveAnswer(attemptId, userId, tenantId, { questionId, selectedChoiceIds: ["choice-a"] })).resolves.toMatchObject({ questionId });
    await expect(service.clearAnswer(attemptId, answerId, userId, tenantId)).resolves.toBeUndefined();
  });

  it("rejects answer changes for missing, inactive, or unrelated attempts", async () => {
    vi.mocked(repository.findAttemptById).mockResolvedValueOnce(null);
    await expect(service.saveAnswer(attemptId, userId, tenantId, { questionId })).rejects.toBeInstanceOf(ExamAttemptNotFoundError);

    vi.mocked(repository.findAttemptById).mockResolvedValueOnce(attemptReview({ attempt: attemptRecord({ status: "submitted" }) }));
    await expect(service.saveAnswer(attemptId, userId, tenantId, { questionId })).rejects.toBeInstanceOf(AttemptNotActiveError);

    vi.mocked(repository.findAttemptById).mockResolvedValueOnce(attemptReview());
    vi.mocked(repository.listExamQuestions).mockResolvedValueOnce([examQuestionRecord({ questionId: "other-question" })]);
    await expect(service.saveAnswer(attemptId, userId, tenantId, { questionId })).rejects.toBeInstanceOf(QuestionNotFoundError);

    vi.mocked(repository.findAttemptById).mockResolvedValueOnce(attemptReview());
    vi.mocked(repository.clearAnswer).mockResolvedValueOnce(false);
    await expect(service.clearAnswer(attemptId, answerId, userId, tenantId)).rejects.toBeInstanceOf(StudentAnswerNotFoundError);
  });

  it("submits attempts and grades selected choices", async () => {
    const result = await service.submitAttempt(attemptId, userId, tenantId);

    expect(repository.updateAttemptScore).toHaveBeenCalledWith(attemptId, tenantId, 2);
    expect(repository.upsertResult).toHaveBeenCalledWith(attemptId, tenantId, 2, 2, true);
    expect(result.result).toMatchObject({ score: 2, maxScore: 2, passed: true });
  });

  it("cancels active attempts", async () => {
    vi.mocked(repository.submitAttempt).mockResolvedValue(attemptReview({ attempt: attemptRecord({ status: "cancelled", submittedAt: now }) }));

    await expect(service.cancelAttempt(attemptId, userId, tenantId)).resolves.toMatchObject({ status: "cancelled" });
  });

  it("manually grades answers", async () => {
    await expect(service.gradeAnswer(answerId, tenantId, { isCorrect: true, pointsAwarded: 2 })).resolves.toMatchObject({ isCorrect: true, pointsAwarded: 2 });

    vi.mocked(repository.gradeAnswer).mockResolvedValue(null);
    await expect(service.gradeAnswer(answerId, tenantId, { pointsAwarded: 0 })).rejects.toBeInstanceOf(StudentAnswerNotFoundError);
  });

  it("gets results, reviews, and statistics", async () => {
    await expect(service.getResult(attemptId, userId, tenantId)).resolves.toMatchObject({ id: "result-id" });
    await expect(service.getReview(attemptId, userId, tenantId)).resolves.toMatchObject({ attempt: { id: attemptId }, answers: [{ id: answerId }] });
    await expect(service.getStatistics(tenantId)).resolves.toMatchObject({ totalExams: 1, totalAttempts: 1 });
  });

  it("throws for missing results and reviews", async () => {
    vi.mocked(repository.getResult).mockResolvedValue(null);
    vi.mocked(repository.findAttemptById).mockResolvedValue(null);

    await expect(service.getResult(attemptId, userId, tenantId)).rejects.toBeInstanceOf(ExamResultNotFoundError);
    await expect(service.getReview(attemptId, userId, tenantId)).rejects.toBeInstanceOf(ExamAttemptNotFoundError);
  });
});
