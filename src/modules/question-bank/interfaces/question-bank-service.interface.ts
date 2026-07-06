import type {
  AttachQuestionPoolDto,
  CreateChoiceDto,
  CreateQuestionDto,
  QuestionChoiceDto,
  QuestionDto,
  QuestionListQueryDto,
  QuestionPoolDto,
  QuestionsListDto,
  QuestionStatisticsDto,
  ReorderChoiceDto,
  UpdateChoiceDto,
  UpdateQuestionDto,
} from "../dto/index.js";

export interface IQuestionBankService {
  createQuestion(tenantId: string, createdById: string | null, data: CreateQuestionDto): Promise<QuestionDto>;
  listQuestions(tenantId: string, query: QuestionListQueryDto): Promise<QuestionsListDto>;
  getQuestionById(id: string, tenantId: string): Promise<QuestionDto>;
  updateQuestion(id: string, tenantId: string, data: UpdateQuestionDto): Promise<QuestionDto>;
  deleteQuestion(id: string, tenantId: string): Promise<void>;
  restoreQuestion(id: string, tenantId: string): Promise<QuestionDto>;
  createChoice(questionId: string, tenantId: string, data: CreateChoiceDto): Promise<QuestionChoiceDto>;
  updateChoice(questionId: string, choiceId: string, tenantId: string, data: UpdateChoiceDto): Promise<QuestionChoiceDto>;
  deleteChoice(questionId: string, choiceId: string, tenantId: string): Promise<void>;
  reorderChoices(questionId: string, tenantId: string, choices: ReorderChoiceDto[]): Promise<QuestionChoiceDto[]>;
  markCorrectChoice(questionId: string, choiceId: string, tenantId: string): Promise<QuestionChoiceDto>;
  attachToPool(questionId: string, tenantId: string, data: AttachQuestionPoolDto): Promise<QuestionPoolDto>;
  listPools(questionId: string, tenantId: string): Promise<QuestionPoolDto[]>;
  removeFromPool(questionId: string, poolId: string, tenantId: string): Promise<void>;
  getStatistics(tenantId: string): Promise<QuestionStatisticsDto>;
}
