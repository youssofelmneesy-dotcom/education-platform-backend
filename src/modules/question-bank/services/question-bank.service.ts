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
import type { IQuestionBankRepository, IQuestionBankService } from "../interfaces/index.js";
import { QuestionBankRepository } from "../repositories/index.js";
import type { ChoiceRecord, QuestionPoolRecord, QuestionRecord } from "../types/index.js";
import { ChoiceNotFoundError, ExamNotFoundError, MultipleCorrectChoicesError, QuestionBankNotFoundError, QuestionNotFoundError, QuestionPoolNotFoundError } from "../utils/index.js";

export class QuestionBankService implements IQuestionBankService {
  constructor(private readonly questionBankRepository: IQuestionBankRepository = new QuestionBankRepository()) {}

  async createQuestion(tenantId: string, createdById: string | null, data: CreateQuestionDto): Promise<QuestionDto> {
    await this.ensureQuestionBankExists(data.questionBankId, tenantId);
    this.ensureSingleCorrectChoice(data.choices ?? []);

    const question = await this.questionBankRepository.createQuestion(tenantId, createdById, data);
    return this.mapQuestion(question);
  }

  async listQuestions(tenantId: string, query: QuestionListQueryDto): Promise<QuestionsListDto> {
    const { questions, total } = await this.questionBankRepository.listQuestions(tenantId, query);

    return {
      questions: questions.map((question) => this.mapQuestion(question)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getQuestionById(id: string, tenantId: string): Promise<QuestionDto> {
    const question = await this.questionBankRepository.findQuestionById(id, tenantId);

    if (!question) {
      throw new QuestionNotFoundError();
    }

    return this.mapQuestion(question);
  }

  async updateQuestion(id: string, tenantId: string, data: UpdateQuestionDto): Promise<QuestionDto> {
    const question = await this.questionBankRepository.findQuestionById(id, tenantId);

    if (!question) {
      throw new QuestionNotFoundError();
    }

    if (data.questionBankId) {
      await this.ensureQuestionBankExists(data.questionBankId, tenantId);
    }

    const updated = await this.questionBankRepository.updateQuestion(id, tenantId, data);

    if (!updated) {
      throw new QuestionNotFoundError();
    }

    return this.mapQuestion(updated);
  }

  async deleteQuestion(id: string, tenantId: string): Promise<void> {
    const deleted = await this.questionBankRepository.softDeleteQuestion(id, tenantId);

    if (!deleted) {
      throw new QuestionNotFoundError();
    }
  }

  async restoreQuestion(id: string, tenantId: string): Promise<QuestionDto> {
    const question = await this.questionBankRepository.restoreQuestion(id, tenantId);

    if (!question) {
      throw new QuestionNotFoundError();
    }

    return this.mapQuestion(question);
  }

  async createChoice(questionId: string, tenantId: string, data: CreateChoiceDto): Promise<QuestionChoiceDto> {
    await this.ensureQuestionExists(questionId, tenantId);
    const choice = await this.questionBankRepository.createChoice(questionId, tenantId, data);

    if (!choice) {
      throw new QuestionNotFoundError();
    }

    return this.mapChoice(choice);
  }

  async updateChoice(questionId: string, choiceId: string, tenantId: string, data: UpdateChoiceDto): Promise<QuestionChoiceDto> {
    await this.ensureQuestionExists(questionId, tenantId);
    const choice = await this.questionBankRepository.updateChoice(questionId, choiceId, tenantId, data);

    if (!choice) {
      throw new ChoiceNotFoundError();
    }

    return this.mapChoice(choice);
  }

  async deleteChoice(questionId: string, choiceId: string, tenantId: string): Promise<void> {
    await this.ensureQuestionExists(questionId, tenantId);
    const deleted = await this.questionBankRepository.deleteChoice(questionId, choiceId, tenantId);

    if (!deleted) {
      throw new ChoiceNotFoundError();
    }
  }

  async reorderChoices(questionId: string, tenantId: string, choices: ReorderChoiceDto[]): Promise<QuestionChoiceDto[]> {
    await this.ensureQuestionExists(questionId, tenantId);
    const reordered = await this.questionBankRepository.reorderChoices(questionId, tenantId, choices);
    return reordered.map((choice) => this.mapChoice(choice));
  }

  async markCorrectChoice(questionId: string, choiceId: string, tenantId: string): Promise<QuestionChoiceDto> {
    await this.ensureQuestionExists(questionId, tenantId);
    const choice = await this.questionBankRepository.markCorrectChoice(questionId, choiceId, tenantId);

    if (!choice) {
      throw new ChoiceNotFoundError();
    }

    return this.mapChoice(choice);
  }

  async attachToPool(questionId: string, tenantId: string, data: AttachQuestionPoolDto): Promise<QuestionPoolDto> {
    await this.ensureQuestionExists(questionId, tenantId);
    await this.ensureExamExists(data.examId, tenantId);
    const pool = await this.questionBankRepository.attachToPool(questionId, tenantId, data);
    return this.mapPool(pool);
  }

  async listPools(questionId: string, tenantId: string): Promise<QuestionPoolDto[]> {
    await this.ensureQuestionExists(questionId, tenantId);
    const pools = await this.questionBankRepository.listPools(questionId, tenantId);
    return pools.map((pool) => this.mapPool(pool));
  }

  async removeFromPool(questionId: string, poolId: string, tenantId: string): Promise<void> {
    await this.ensureQuestionExists(questionId, tenantId);
    const removed = await this.questionBankRepository.removeFromPool(questionId, poolId, tenantId);

    if (!removed) {
      throw new QuestionPoolNotFoundError();
    }
  }

  async getStatistics(tenantId: string): Promise<QuestionStatisticsDto> {
    return this.questionBankRepository.getStatistics(tenantId);
  }

  private async ensureQuestionBankExists(questionBankId: string, tenantId: string): Promise<void> {
    const exists = await this.questionBankRepository.questionBankExists(questionBankId, tenantId);

    if (!exists) {
      throw new QuestionBankNotFoundError();
    }
  }

  private async ensureExamExists(examId: string, tenantId: string): Promise<void> {
    const exists = await this.questionBankRepository.examExists(examId, tenantId);

    if (!exists) {
      throw new ExamNotFoundError();
    }
  }

  private async ensureQuestionExists(questionId: string, tenantId: string): Promise<void> {
    const question = await this.questionBankRepository.findQuestionById(questionId, tenantId);

    if (!question) {
      throw new QuestionNotFoundError();
    }
  }

  private ensureSingleCorrectChoice(choices: CreateChoiceDto[]): void {
    const correctChoices = choices.filter((choice) => choice.isCorrect).length;

    if (correctChoices > 1) {
      throw new MultipleCorrectChoicesError();
    }
  }

  private mapQuestion(question: QuestionRecord): QuestionDto {
    return {
      id: question.id,
      questionBankId: question.questionBankId,
      courseId: question.questionBank.courseId,
      createdById: question.createdById,
      type: question.type,
      prompt: question.prompt,
      explanation: question.explanation,
      points: question.points,
      sortOrder: question.sortOrder,
      choices: question.choices.map((choice) => this.mapChoice(choice)),
      poolIds: question.questionPools.map((pool) => pool.id),
      examIds: [...new Set(question.questionPools.map((pool) => pool.examId))],
      lessonIds: [...new Set(question.questionPools.map((pool) => pool.exam.lessonId).filter((lessonId): lessonId is string => Boolean(lessonId)))],
      deletedAt: question.deletedAt?.toISOString() ?? null,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }

  private mapChoice(choice: ChoiceRecord): QuestionChoiceDto {
    return {
      id: choice.id,
      questionId: choice.questionId,
      content: choice.content,
      isCorrect: choice.isCorrect,
      sortOrder: choice.sortOrder,
      createdAt: choice.createdAt.toISOString(),
      updatedAt: choice.updatedAt.toISOString(),
    };
  }

  private mapPool(pool: QuestionPoolRecord): QuestionPoolDto {
    return {
      id: pool.id,
      examId: pool.examId,
      questionId: pool.questionId,
      courseId: pool.exam.courseId,
      lessonId: pool.exam.lessonId,
      points: pool.points,
      sortOrder: pool.sortOrder,
      createdAt: pool.createdAt.toISOString(),
      updatedAt: pool.updatedAt.toISOString(),
    };
  }
}
