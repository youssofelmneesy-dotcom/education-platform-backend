import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IQuestionBankRepository } from "../../../src/modules/question-bank/interfaces/index.js";
import { QuestionBankService } from "../../../src/modules/question-bank/services/question-bank.service.js";
import {
  ChoiceNotFoundError,
  ExamNotFoundError,
  MultipleCorrectChoicesError,
  QuestionBankNotFoundError,
  QuestionNotFoundError,
  QuestionPoolNotFoundError,
} from "../../../src/modules/question-bank/utils/index.js";

function createRepositoryMock(): IQuestionBankRepository & Record<string, ReturnType<typeof vi.fn>> {
  return {
    questionBankExists: vi.fn(),
    examExists: vi.fn(),
    createQuestion: vi.fn(),
    listQuestions: vi.fn(),
    findQuestionById: vi.fn(),
    updateQuestion: vi.fn(),
    softDeleteQuestion: vi.fn(),
    restoreQuestion: vi.fn(),
    createChoice: vi.fn(),
    updateChoice: vi.fn(),
    deleteChoice: vi.fn(),
    reorderChoices: vi.fn(),
    markCorrectChoice: vi.fn(),
    attachToPool: vi.fn(),
    listPools: vi.fn(),
    removeFromPool: vi.fn(),
    getStatistics: vi.fn(),
  };
}

function choice(overrides: Record<string, unknown> = {}) {
  return {
    id: "choice-123",
    questionId: "question-123",
    content: "Choice A",
    isCorrect: true,
    sortOrder: 0,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

function pool(overrides: Record<string, unknown> = {}) {
  return {
    id: "pool-123",
    examId: "exam-123",
    questionId: "question-123",
    points: 1,
    sortOrder: 0,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    exam: { courseId: "course-123", lessonId: "lesson-123" },
    ...overrides,
  };
}

function question(overrides: Record<string, unknown> = {}) {
  return {
    id: "question-123",
    questionBankId: "bank-123",
    createdById: "user-123",
    type: "single_choice",
    prompt: "Prompt",
    explanation: null,
    points: 1,
    sortOrder: 0,
    deletedAt: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    questionBank: { courseId: "course-123" },
    choices: [choice()],
    questionPools: [pool()],
    ...overrides,
  };
}

describe("QuestionBankService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: QuestionBankService;
  const tenantId = "tenant-123";
  const userId = "user-123";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new QuestionBankService(repository);
  });

  describe("questions", () => {
    it("should create, list, get, update, delete, and restore questions", async () => {
      // Arrange
      repository.questionBankExists.mockResolvedValue(true);
      repository.createQuestion.mockResolvedValue(question());
      repository.listQuestions.mockResolvedValue({ questions: [question()], total: 1 });
      repository.findQuestionById.mockResolvedValue(question());
      repository.updateQuestion.mockResolvedValue(question({ prompt: "Updated prompt" }));
      repository.softDeleteQuestion.mockResolvedValue(true);
      repository.restoreQuestion.mockResolvedValue(question({ deletedAt: null }));

      // Act
      const created = await service.createQuestion(tenantId, userId, { questionBankId: "bank-123", type: "single_choice", prompt: "Prompt" });
      const list = await service.listQuestions(tenantId, { page: 1, limit: 10 });
      const found = await service.getQuestionById("question-123", tenantId);
      const updated = await service.updateQuestion("question-123", tenantId, { prompt: "Updated prompt" });
      await service.deleteQuestion("question-123", tenantId);
      const restored = await service.restoreQuestion("question-123", tenantId);

      // Assert
      expect(created.id).toBe("question-123");
      expect(list.total).toBe(1);
      expect(found.examIds).toEqual(["exam-123"]);
      expect(updated.prompt).toBe("Updated prompt");
      expect(repository.softDeleteQuestion).toHaveBeenCalledWith("question-123", tenantId);
      expect(restored.id).toBe("question-123");
    });

    it("should reject missing question banks and multiple correct choices", async () => {
      // Arrange
      repository.questionBankExists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      // Act & Assert
      await expect(service.createQuestion(tenantId, userId, { questionBankId: "missing", type: "single_choice", prompt: "Prompt" })).rejects.toThrow(QuestionBankNotFoundError);
      await expect(
        service.createQuestion(tenantId, userId, {
          questionBankId: "bank-123",
          type: "single_choice",
          prompt: "Prompt",
          choices: [
            { content: "A", isCorrect: true },
            { content: "B", isCorrect: true },
          ],
        })
      ).rejects.toThrow(MultipleCorrectChoicesError);
    });

    it("should throw QuestionNotFoundError for missing question operations", async () => {
      // Arrange
      repository.findQuestionById.mockResolvedValue(null);
      repository.softDeleteQuestion.mockResolvedValue(false);
      repository.restoreQuestion.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getQuestionById("missing", tenantId)).rejects.toThrow(QuestionNotFoundError);
      await expect(service.updateQuestion("missing", tenantId, { prompt: "Updated" })).rejects.toThrow(QuestionNotFoundError);
      await expect(service.deleteQuestion("missing", tenantId)).rejects.toThrow(QuestionNotFoundError);
      await expect(service.restoreQuestion("missing", tenantId)).rejects.toThrow(QuestionNotFoundError);
    });
  });

  describe("choices", () => {
    it("should create, update, delete, reorder, and mark correct choices", async () => {
      // Arrange
      repository.findQuestionById.mockResolvedValue(question());
      repository.createChoice.mockResolvedValue(choice({ id: "choice-new" }));
      repository.updateChoice.mockResolvedValue(choice({ content: "Updated choice" }));
      repository.deleteChoice.mockResolvedValue(true);
      repository.reorderChoices.mockResolvedValue([choice({ sortOrder: 2 })]);
      repository.markCorrectChoice.mockResolvedValue(choice({ id: "choice-correct", isCorrect: true }));

      // Act
      const created = await service.createChoice("question-123", tenantId, { content: "New choice" });
      const updated = await service.updateChoice("question-123", "choice-123", tenantId, { content: "Updated choice" });
      await service.deleteChoice("question-123", "choice-123", tenantId);
      const reordered = await service.reorderChoices("question-123", tenantId, [{ id: "choice-123", sortOrder: 2 }]);
      const correct = await service.markCorrectChoice("question-123", "choice-correct", tenantId);

      // Assert
      expect(created.id).toBe("choice-new");
      expect(updated.content).toBe("Updated choice");
      expect(repository.deleteChoice).toHaveBeenCalledWith("question-123", "choice-123", tenantId);
      expect(reordered[0]?.sortOrder).toBe(2);
      expect(correct.id).toBe("choice-correct");
    });

    it("should throw ChoiceNotFoundError when choice operations miss", async () => {
      // Arrange
      repository.findQuestionById.mockResolvedValue(question());
      repository.updateChoice.mockResolvedValue(null);
      repository.deleteChoice.mockResolvedValue(false);
      repository.markCorrectChoice.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateChoice("question-123", "missing", tenantId, { content: "Updated" })).rejects.toThrow(ChoiceNotFoundError);
      await expect(service.deleteChoice("question-123", "missing", tenantId)).rejects.toThrow(ChoiceNotFoundError);
      await expect(service.markCorrectChoice("question-123", "missing", tenantId)).rejects.toThrow(ChoiceNotFoundError);
    });
  });

  describe("pools and statistics", () => {
    it("should attach, list, remove pools, and return statistics", async () => {
      // Arrange
      repository.findQuestionById.mockResolvedValue(question());
      repository.examExists.mockResolvedValue(true);
      repository.attachToPool.mockResolvedValue(pool());
      repository.listPools.mockResolvedValue([pool()]);
      repository.removeFromPool.mockResolvedValue(true);
      repository.getStatistics.mockResolvedValue({
        totalQuestions: 1,
        questionsByType: [{ type: "single_choice", count: 1 }],
        questionsPerCourse: [{ courseId: "course-123", count: 1 }],
        questionsPerLesson: [{ lessonId: "lesson-123", count: 1 }],
      });

      // Act
      const attached = await service.attachToPool("question-123", tenantId, { examId: "exam-123" });
      const pools = await service.listPools("question-123", tenantId);
      await service.removeFromPool("question-123", "pool-123", tenantId);
      const stats = await service.getStatistics(tenantId);

      // Assert
      expect(attached.id).toBe("pool-123");
      expect(pools).toHaveLength(1);
      expect(repository.removeFromPool).toHaveBeenCalledWith("question-123", "pool-123", tenantId);
      expect(stats.totalQuestions).toBe(1);
    });

    it("should throw for missing exam and missing pool", async () => {
      // Arrange
      repository.findQuestionById.mockResolvedValue(question());
      repository.examExists.mockResolvedValue(false);
      repository.removeFromPool.mockResolvedValue(false);

      // Act & Assert
      await expect(service.attachToPool("question-123", tenantId, { examId: "missing" })).rejects.toThrow(ExamNotFoundError);
      await expect(service.removeFromPool("question-123", "missing", tenantId)).rejects.toThrow(QuestionPoolNotFoundError);
    });
  });
});
