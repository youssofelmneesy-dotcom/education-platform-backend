import type { AssessmentStatisticsDto, AssignQuestionDto, CreateExamDto, ExamAttemptDto, ExamDto, ExamListQueryDto, ExamQuestionDto, ExamResultDto, ExamReviewDto, ExamsListDto, ManualGradeAnswerDto, ReorderExamQuestionDto, SaveAnswerDto, StudentAnswerDto, UpdateExamDto } from "../dto/index.js";
import type { IAssessmentRepository, IAssessmentService } from "../interfaces/index.js";
import { AssessmentRepository } from "../repositories/index.js";
import type { AttemptReviewRecord, ExamAttemptRecord, ExamQuestionRecord, ExamRecord, ExamResultRecord, StudentAnswerRecord } from "../types/index.js";
import { ActiveAttemptExistsError, AttemptNotActiveError, ExamAttemptNotFoundError, ExamQuestionNotFoundError, ExamResultNotFoundError, ExamUnavailableError, MaxAttemptsReachedError, QuestionNotFoundError, RelatedAssessmentResourceNotFoundError, StudentAnswerNotFoundError } from "../utils/index.js";
import { ExamNotFoundError } from "../utils/index.js";

export class AssessmentService implements IAssessmentService {
  constructor(private readonly assessmentRepository: IAssessmentRepository = new AssessmentRepository()) {}

  async createExam(tenantId: string, data: CreateExamDto): Promise<ExamDto> {
    await this.ensureRelatedResources(tenantId, data);
    return this.mapExam(await this.assessmentRepository.createExam(tenantId, data));
  }

  async listExams(tenantId: string, query: ExamListQueryDto): Promise<ExamsListDto> {
    const { exams, total } = await this.assessmentRepository.listExams(tenantId, query);
    return { exams: exams.map((exam) => this.mapExam(exam)), total, page: query.page, limit: query.limit };
  }

  async getExam(id: string, tenantId: string): Promise<ExamDto> {
    return this.mapExam(await this.ensureExam(id, tenantId));
  }

  async updateExam(id: string, tenantId: string, data: UpdateExamDto): Promise<ExamDto> {
    await this.ensureExam(id, tenantId);
    await this.ensureRelatedResources(tenantId, data);
    const exam = await this.assessmentRepository.updateExam(id, tenantId, data);
    if (!exam) throw new ExamNotFoundError();
    return this.mapExam(exam);
  }

  async deleteExam(id: string, tenantId: string): Promise<void> {
    if (!(await this.assessmentRepository.softDeleteExam(id, tenantId))) throw new ExamNotFoundError();
  }

  async restoreExam(id: string, tenantId: string): Promise<ExamDto> {
    const exam = await this.assessmentRepository.restoreExam(id, tenantId);
    if (!exam) throw new ExamNotFoundError();
    return this.mapExam(exam);
  }

  async assignQuestion(examId: string, tenantId: string, data: AssignQuestionDto): Promise<ExamQuestionDto> {
    await this.ensureExam(examId, tenantId);
    if (!(await this.assessmentRepository.questionExists(data.questionId, tenantId))) throw new QuestionNotFoundError();
    return this.mapExamQuestion(await this.assessmentRepository.assignQuestion(examId, tenantId, data));
  }

  async listExamQuestions(examId: string, tenantId: string): Promise<ExamQuestionDto[]> {
    await this.ensureExam(examId, tenantId);
    return (await this.assessmentRepository.listExamQuestions(examId, tenantId)).map((question) => this.mapExamQuestion(question));
  }

  async removeQuestion(examId: string, poolId: string, tenantId: string): Promise<void> {
    await this.ensureExam(examId, tenantId);
    if (!(await this.assessmentRepository.removeQuestion(examId, poolId, tenantId))) throw new ExamQuestionNotFoundError();
  }

  async reorderQuestions(examId: string, tenantId: string, questions: ReorderExamQuestionDto[]): Promise<ExamQuestionDto[]> {
    await this.ensureExam(examId, tenantId);
    return (await this.assessmentRepository.reorderQuestions(examId, tenantId, questions)).map((question) => this.mapExamQuestion(question));
  }

  async startAttempt(examId: string, userId: string, tenantId: string): Promise<ExamAttemptDto> {
    const exam = await this.ensureExam(examId, tenantId);
    this.ensureExamAvailable(exam);
    const active = await this.assessmentRepository.findActiveAttempt(examId, userId, tenantId);
    if (active) throw new ActiveAttemptExistsError();
    const attemptCount = await this.assessmentRepository.countAttempts(examId, userId, tenantId);
    if (exam.maxAttempts && attemptCount >= exam.maxAttempts) throw new MaxAttemptsReachedError();
    return this.mapAttempt(await this.assessmentRepository.createAttempt(examId, userId, tenantId, attemptCount + 1));
  }

  async resumeAttempt(examId: string, userId: string, tenantId: string): Promise<ExamAttemptDto> {
    const active = await this.assessmentRepository.findActiveAttempt(examId, userId, tenantId);
    if (!active) throw new ExamAttemptNotFoundError();
    return this.mapAttempt(active);
  }

  async saveAnswer(attemptId: string, userId: string, tenantId: string, data: SaveAnswerDto): Promise<StudentAnswerDto> {
    const review = await this.ensureActiveAttempt(attemptId, userId, tenantId);
    const examQuestions = await this.assessmentRepository.listExamQuestions(review.attempt.examId, tenantId);
    if (!examQuestions.some((question) => question.questionId === data.questionId)) throw new QuestionNotFoundError();
    return this.mapAnswer(await this.assessmentRepository.saveAnswer(attemptId, userId, tenantId, data));
  }

  async clearAnswer(attemptId: string, answerId: string, userId: string, tenantId: string): Promise<void> {
    await this.ensureActiveAttempt(attemptId, userId, tenantId);
    if (!(await this.assessmentRepository.clearAnswer(attemptId, answerId, userId, tenantId))) throw new StudentAnswerNotFoundError();
  }

  async submitAttempt(attemptId: string, userId: string, tenantId: string): Promise<ExamReviewDto> {
    const active = await this.ensureActiveAttempt(attemptId, userId, tenantId);
    const exam = await this.ensureExam(active.attempt.examId, tenantId);
    const status = this.isTimedOut(exam, active.attempt.startedAt) ? "timed_out" : "submitted";
    const submitted = await this.assessmentRepository.submitAttempt(attemptId, userId, tenantId, status);
    if (!submitted) throw new ExamAttemptNotFoundError();
    const questions = await this.assessmentRepository.listExamQuestions(submitted.attempt.examId, tenantId);
    const { score, maxScore } = this.gradeAnswers(submitted.answers, questions);
    const passed = exam.passingScore !== null ? score >= exam.passingScore : score >= maxScore;
    await this.assessmentRepository.updateAttemptScore(attemptId, tenantId, score);
    const result = await this.assessmentRepository.upsertResult(attemptId, tenantId, score, maxScore, passed);
    return { attempt: this.mapAttempt({ ...submitted.attempt, score }), answers: submitted.answers.map((answer) => this.mapAnswer(answer)), result: this.mapResult(result) };
  }

  async cancelAttempt(attemptId: string, userId: string, tenantId: string): Promise<ExamAttemptDto> {
    const active = await this.ensureActiveAttempt(attemptId, userId, tenantId);
    const cancelled = await this.assessmentRepository.submitAttempt(attemptId, userId, tenantId, "cancelled");
    return this.mapAttempt(cancelled?.attempt ?? active.attempt);
  }

  async gradeAnswer(answerId: string, tenantId: string, data: ManualGradeAnswerDto): Promise<StudentAnswerDto> {
    const answer = await this.assessmentRepository.gradeAnswer(answerId, tenantId, data);
    if (!answer) throw new StudentAnswerNotFoundError();
    return this.mapAnswer(answer);
  }

  async getResult(attemptId: string, userId: string | null, tenantId: string): Promise<ExamResultDto> {
    const result = await this.assessmentRepository.getResult(attemptId, userId, tenantId);
    if (!result) throw new ExamResultNotFoundError();
    return this.mapResult(result);
  }

  async getReview(attemptId: string, userId: string | null, tenantId: string): Promise<ExamReviewDto> {
    const review = await this.assessmentRepository.findAttemptById(attemptId, userId, tenantId);
    if (!review) throw new ExamAttemptNotFoundError();
    return { attempt: this.mapAttempt(review.attempt), result: review.result ? this.mapResult(review.result) : null, answers: review.answers.map((answer) => this.mapAnswer(answer)) };
  }

  async getStatistics(tenantId: string): Promise<AssessmentStatisticsDto> { return this.assessmentRepository.getStatistics(tenantId); }

  private async ensureRelatedResources(tenantId: string, data: { courseId?: string; lessonId?: string | null; questionBankId?: string | null }): Promise<void> {
    if (!(await this.assessmentRepository.relatedResourcesExist(tenantId, data))) throw new RelatedAssessmentResourceNotFoundError();
  }
  private async ensureExam(id: string, tenantId: string): Promise<ExamRecord> { const exam = await this.assessmentRepository.findExamById(id, tenantId); if (!exam) throw new ExamNotFoundError(); return exam; }
  private ensureExamAvailable(exam: ExamRecord): void { const now = Date.now(); if (exam.status !== "published" || (exam.startsAt && exam.startsAt.getTime() > now) || (exam.endsAt && exam.endsAt.getTime() < now)) throw new ExamUnavailableError(); }
  private async ensureActiveAttempt(attemptId: string, userId: string, tenantId: string): Promise<AttemptReviewRecord> { const review = await this.assessmentRepository.findAttemptById(attemptId, userId, tenantId); if (!review) throw new ExamAttemptNotFoundError(); if (review.attempt.status !== "in_progress") throw new AttemptNotActiveError(); return review; }
  private isTimedOut(exam: ExamRecord, startedAt: Date): boolean { return Boolean(exam.timeLimitMinutes && Date.now() > startedAt.getTime() + exam.timeLimitMinutes * 60_000); }
  private gradeAnswers(answers: StudentAnswerRecord[], questions: ExamQuestionRecord[]): { score: number; maxScore: number } {
    let score = 0; const maxScore = questions.reduce((sum, question) => sum + question.points, 0);
    for (const question of questions) { const answer = answers.find((item) => item.questionId === question.questionId); if (!answer) continue; const correct = question.question.choices.filter((choice) => choice.isCorrect).map((choice) => choice.id).sort(); const selected = [...answer.selectedChoiceIds].sort(); if (correct.length && correct.join(",") === selected.join(",")) score += question.points; }
    return { score, maxScore };
  }
  private mapExam(exam: ExamRecord): ExamDto { const maxScore = exam.questionPools.reduce((sum, pool) => sum + pool.points, 0); return { id: exam.id, courseId: exam.courseId, lessonId: exam.lessonId, questionBankId: exam.questionBankId, title: exam.title, description: exam.description, status: exam.status, timeLimitMinutes: exam.timeLimitMinutes, passingScore: exam.passingScore, maxAttempts: exam.maxAttempts, startsAt: exam.startsAt?.toISOString() ?? null, endsAt: exam.endsAt?.toISOString() ?? null, questionCount: exam.questionPools.length, maxScore, deletedAt: exam.deletedAt?.toISOString() ?? null, createdAt: exam.createdAt.toISOString(), updatedAt: exam.updatedAt.toISOString() }; }
  private mapExamQuestion(pool: ExamQuestionRecord): ExamQuestionDto { return { id: pool.id, examId: pool.examId, questionId: pool.questionId, points: pool.points, sortOrder: pool.sortOrder, prompt: pool.question.prompt, type: pool.question.type, choices: pool.question.choices.map((choice) => ({ id: choice.id, content: choice.content, sortOrder: choice.sortOrder })), createdAt: pool.createdAt.toISOString(), updatedAt: pool.updatedAt.toISOString() }; }
  private mapAttempt(attempt: ExamAttemptRecord): ExamAttemptDto { return { id: attempt.id, examId: attempt.examId, userId: attempt.userId, attemptNumber: attempt.attemptNumber, status: attempt.status, startedAt: attempt.startedAt.toISOString(), submittedAt: attempt.submittedAt?.toISOString() ?? null, score: attempt.score, createdAt: attempt.createdAt.toISOString(), updatedAt: attempt.updatedAt.toISOString() }; }
  private mapAnswer(answer: StudentAnswerRecord): StudentAnswerDto { return { id: answer.id, examAttemptId: answer.examAttemptId, questionId: answer.questionId, userId: answer.userId, answerText: answer.answerText, selectedChoiceIds: answer.selectedChoiceIds, isCorrect: answer.isCorrect, pointsAwarded: answer.pointsAwarded, createdAt: answer.createdAt.toISOString(), updatedAt: answer.updatedAt.toISOString() }; }
  private mapResult(result: ExamResultRecord): ExamResultDto { return { id: result.id, examId: result.examId, examAttemptId: result.examAttemptId, userId: result.userId, score: result.score, maxScore: result.maxScore, passed: result.passed, gradedAt: result.gradedAt?.toISOString() ?? null, createdAt: result.createdAt.toISOString(), updatedAt: result.updatedAt.toISOString() }; }
}
