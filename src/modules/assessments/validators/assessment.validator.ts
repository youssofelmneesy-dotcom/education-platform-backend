import { z } from "zod";

export const idParamsSchema = z.object({ id: z.string().uuid() });
export const attemptIdParamsSchema = z.object({ attemptId: z.string().uuid() });
export const poolIdParamsSchema = z.object({ id: z.string().uuid(), poolId: z.string().uuid() });
export const answerIdParamsSchema = z.object({ attemptId: z.string().uuid(), answerId: z.string().uuid() });
export const gradeAnswerParamsSchema = z.object({ answerId: z.string().uuid() });

export const createExamSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid().nullable().optional(),
  questionBankId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().nullable().optional(),
  status: z.string().trim().min(1).max(30).optional(),
  timeLimitMinutes: z.number().int().min(1).nullable().optional(),
  passingScore: z.number().int().min(0).nullable().optional(),
  maxAttempts: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
});

export const updateExamSchema = createExamSchema.partial();

export const examListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().min(1).optional(),
  courseId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  questionBankId: z.string().uuid().optional(),
  status: z.string().trim().min(1).max(30).optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "status", "startsAt", "endsAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const assignQuestionSchema = z.object({ questionId: z.string().uuid(), points: z.number().int().min(0).optional(), sortOrder: z.number().int().min(0).optional() });
export const reorderExamQuestionsSchema = z.object({ questions: z.array(z.object({ poolId: z.string().uuid(), sortOrder: z.number().int().min(0) })).min(1) });
export const saveAnswerSchema = z.object({ questionId: z.string().uuid(), answerText: z.string().nullable().optional(), selectedChoiceIds: z.array(z.string().uuid()).optional() });
export const manualGradeAnswerSchema = z.object({ isCorrect: z.boolean().nullable().optional(), pointsAwarded: z.number().int().min(0) });
