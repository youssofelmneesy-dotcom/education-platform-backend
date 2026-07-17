import { describe, expect, it } from "vitest";

import {
  attachQuestionPoolSchema,
  createChoiceSchema,
  createQuestionSchema,
  markCorrectChoiceSchema,
  questionChoiceParamsSchema,
  questionIdParamsSchema,
  questionListQuerySchema,
  questionPoolParamsSchema,
  reorderChoicesSchema,
  updateChoiceSchema,
  updateQuestionSchema,
} from "../../../src/modules/question-bank/validators/index.js";

const uuid = "00000000-0000-0000-0000-000000000000";

describe("Question Bank Validators", () => {
  describe("question schemas", () => {
    it("should pass valid create and update question payloads", () => {
      // Act & Assert
      expect(
        createQuestionSchema.safeParse({
          questionBankId: uuid,
          type: "single_choice",
          prompt: "What is TypeScript?",
          choices: [{ content: "A language", isCorrect: true }],
        }).success
      ).toBe(true);
      expect(updateQuestionSchema.safeParse({ prompt: "Updated prompt", points: 2 }).success).toBe(true);
    });

    it("should fail invalid question payloads", () => {
      // Act & Assert
      expect(createQuestionSchema.safeParse({ questionBankId: "bad-id", type: "single_choice", prompt: "Prompt" }).success).toBe(false);
      expect(createQuestionSchema.safeParse({ questionBankId: uuid, type: "", prompt: "Prompt" }).success).toBe(false);
      expect(createQuestionSchema.safeParse({ questionBankId: uuid, type: "single_choice", prompt: "" }).success).toBe(false);
      expect(updateQuestionSchema.safeParse({ points: -1 }).success).toBe(false);
      expect(updateQuestionSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
    });
  });

  describe("choice schemas", () => {
    it("should pass valid choice payloads", () => {
      // Act & Assert
      expect(createChoiceSchema.safeParse({ content: "Choice", isCorrect: true, sortOrder: 0 }).success).toBe(true);
      expect(updateChoiceSchema.safeParse({ content: "Updated" }).success).toBe(true);
    });

    it("should fail invalid choice payloads", () => {
      // Act & Assert
      expect(createChoiceSchema.safeParse({ content: "" }).success).toBe(false);
      expect(createChoiceSchema.safeParse({ content: "Choice", sortOrder: -1 }).success).toBe(false);
      expect(updateChoiceSchema.safeParse({ content: "" }).success).toBe(false);
    });
  });

  describe("query and params schemas", () => {
    it("should coerce query defaults and pass valid params", () => {
      // Act
      const query = questionListQuerySchema.safeParse({ page: "2", limit: "20", includeDeleted: "true" });

      // Assert
      expect(query.success).toBe(true);
      expect(query.data).toMatchObject({ page: 2, limit: 20, includeDeleted: true, sortBy: "createdAt", sortOrder: "desc" });
      expect(questionIdParamsSchema.safeParse({ id: uuid }).success).toBe(true);
      expect(questionChoiceParamsSchema.safeParse({ id: uuid, choiceId: uuid }).success).toBe(true);
      expect(questionPoolParamsSchema.safeParse({ id: uuid, poolId: uuid }).success).toBe(true);
    });

    it("should fail invalid query and params values", () => {
      // Act & Assert
      expect(questionListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
      expect(questionListQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
      expect(questionListQuerySchema.safeParse({ sortBy: "unknown" }).success).toBe(false);
      expect(questionListQuerySchema.safeParse({ questionBankId: "bad-id" }).success).toBe(false);
      expect(questionIdParamsSchema.safeParse({ id: "bad-id" }).success).toBe(false);
    });
  });

  describe("pool and reorder schemas", () => {
    it("should pass valid pool and reorder payloads", () => {
      // Act & Assert
      expect(reorderChoicesSchema.safeParse({ choices: [{ id: uuid, sortOrder: 1 }] }).success).toBe(true);
      expect(markCorrectChoiceSchema.safeParse({ choiceId: uuid }).success).toBe(true);
      expect(attachQuestionPoolSchema.safeParse({ examId: uuid, points: 1, sortOrder: 0 }).success).toBe(true);
    });

    it("should fail invalid pool and reorder payloads", () => {
      // Act & Assert
      expect(reorderChoicesSchema.safeParse({ choices: [] }).success).toBe(false);
      expect(reorderChoicesSchema.safeParse({ choices: [{ id: "bad-id", sortOrder: 1 }] }).success).toBe(false);
      expect(markCorrectChoiceSchema.safeParse({ choiceId: "bad-id" }).success).toBe(false);
      expect(attachQuestionPoolSchema.safeParse({ examId: uuid, points: -1 }).success).toBe(false);
    });
  });
});
