import { z } from "zod";

export const questionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const questionChoiceParamsSchema = z.object({
  id: z.string().uuid(),
  choiceId: z.string().uuid(),
});

export const questionPoolParamsSchema = z.object({
  id: z.string().uuid(),
  poolId: z.string().uuid(),
});

export const createChoiceSchema = z.object({
  content: z.string().trim().min(1),
  isCorrect: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateChoiceSchema = z.object({
  content: z.string().trim().min(1).optional(),
  isCorrect: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createQuestionSchema = z.object({
  questionBankId: z.string().uuid(),
  type: z.string().trim().min(1).max(50),
  prompt: z.string().trim().min(1),
  explanation: z.string().trim().nullable().optional(),
  points: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  choices: z.array(createChoiceSchema).optional(),
});

export const updateQuestionSchema = z.object({
  questionBankId: z.string().uuid().optional(),
  type: z.string().trim().min(1).max(50).optional(),
  prompt: z.string().trim().min(1).optional(),
  explanation: z.string().trim().nullable().optional(),
  points: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const questionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).max(50).optional(),
  questionBankId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "sortOrder", "points", "type"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  includeDeleted: z.coerce.boolean().optional().default(false),
});

export const reorderChoicesSchema = z.object({
  choices: z.array(z.object({ id: z.string().uuid(), sortOrder: z.number().int().min(0) })).min(1),
});

export const markCorrectChoiceSchema = z.object({
  choiceId: z.string().uuid(),
});

export const attachQuestionPoolSchema = z.object({
  examId: z.string().uuid(),
  points: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
