import type { AttachQuestionPoolDto, CreateChoiceDto, CreateQuestionDto, QuestionListQueryDto, ReorderChoiceDto, UpdateChoiceDto, UpdateQuestionDto } from "../dto/index.js";
import type { ChoiceRecord, QuestionPoolRecord, QuestionRecord } from "../types/index.js";

export interface IQuestionBankRepository {
  questionBankExists(questionBankId: string, tenantId: string): Promise<boolean>;
  examExists(examId: string, tenantId: string): Promise<boolean>;
  createQuestion(tenantId: string, createdById: string | null, data: CreateQuestionDto): Promise<QuestionRecord>;
  listQuestions(tenantId: string, query: QuestionListQueryDto): Promise<{ questions: QuestionRecord[]; total: number }>;
  findQuestionById(id: string, tenantId: string, includeDeleted?: boolean): Promise<QuestionRecord | null>;
  updateQuestion(id: string, tenantId: string, data: UpdateQuestionDto): Promise<QuestionRecord | null>;
  softDeleteQuestion(id: string, tenantId: string): Promise<boolean>;
  restoreQuestion(id: string, tenantId: string): Promise<QuestionRecord | null>;
  createChoice(questionId: string, tenantId: string, data: CreateChoiceDto): Promise<ChoiceRecord | null>;
  updateChoice(questionId: string, choiceId: string, tenantId: string, data: UpdateChoiceDto): Promise<ChoiceRecord | null>;
  deleteChoice(questionId: string, choiceId: string, tenantId: string): Promise<boolean>;
  reorderChoices(questionId: string, tenantId: string, choices: ReorderChoiceDto[]): Promise<ChoiceRecord[]>;
  markCorrectChoice(questionId: string, choiceId: string, tenantId: string): Promise<ChoiceRecord | null>;
  attachToPool(questionId: string, tenantId: string, data: AttachQuestionPoolDto): Promise<QuestionPoolRecord>;
  listPools(questionId: string, tenantId: string): Promise<QuestionPoolRecord[]>;
  removeFromPool(questionId: string, poolId: string, tenantId: string): Promise<boolean>;
  getStatistics(tenantId: string): Promise<{
    totalQuestions: number;
    questionsByType: Array<{ type: string; count: number }>;
    questionsPerCourse: Array<{ courseId: string; count: number }>;
    questionsPerLesson: Array<{ lessonId: string; count: number }>;
  }>;
}
