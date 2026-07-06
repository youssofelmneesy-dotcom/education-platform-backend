import { prisma } from "../../../database/index.js";
import type { AssignQuestionDto, CreateExamDto, ExamListQueryDto, ManualGradeAnswerDto, ReorderExamQuestionDto, SaveAnswerDto, UpdateExamDto } from "../dto/index.js";
import type { IAssessmentRepository } from "../interfaces/index.js";

const examInclude = { questionPools: { where: { deletedAt: null }, select: { points: true } } } as const;
const questionPoolSelect = {
  id: true, examId: true, questionId: true, points: true, sortOrder: true, createdAt: true, updatedAt: true,
  question: { select: { id: true, type: true, prompt: true, choices: { where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" as const }], select: { id: true, content: true, isCorrect: true, sortOrder: true } } } },
};
const attemptSelect = { id: true, examId: true, userId: true, attemptNumber: true, status: true, startedAt: true, submittedAt: true, score: true, createdAt: true, updatedAt: true };
const answerSelect = { id: true, examAttemptId: true, questionId: true, userId: true, answerText: true, selectedChoiceIds: true, isCorrect: true, pointsAwarded: true, createdAt: true, updatedAt: true };
const resultSelect = { id: true, examId: true, examAttemptId: true, userId: true, score: true, maxScore: true, passed: true, gradedAt: true, createdAt: true, updatedAt: true };

export class AssessmentRepository implements IAssessmentRepository {
  async relatedResourcesExist(tenantId: string, data: { courseId?: string; lessonId?: string | null; questionBankId?: string | null }): Promise<boolean> {
    const [course, lesson, bank] = await Promise.all([
      data.courseId ? prisma.course.count({ where: { id: data.courseId, tenantId, deletedAt: null } }) : 1,
      data.lessonId ? prisma.lesson.count({ where: { id: data.lessonId, tenantId, deletedAt: null } }) : 1,
      data.questionBankId ? prisma.questionBank.count({ where: { id: data.questionBankId, tenantId, deletedAt: null } }) : 1,
    ]);
    return course > 0 && lesson > 0 && bank > 0;
  }

  async createExam(tenantId: string, data: CreateExamDto) {
    return prisma.exam.create({
      data: {
        tenantId,
        courseId: data.courseId,
        lessonId: data.lessonId,
        questionBankId: data.questionBankId,
        title: data.title,
        description: data.description,
        status: data.status,
        timeLimitMinutes: data.timeLimitMinutes,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        startsAt: data.startsAt ? new Date(data.startsAt) : data.startsAt,
        endsAt: data.endsAt ? new Date(data.endsAt) : data.endsAt,
      },
      include: examInclude,
    });
  }

  async listExams(tenantId: string, query: ExamListQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      tenantId,
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.search ? { OR: [{ title: { contains: query.search, mode: "insensitive" as const } }, { description: { contains: query.search, mode: "insensitive" as const } }] } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.lessonId ? { lessonId: query.lessonId } : {}),
      ...(query.questionBankId ? { questionBankId: query.questionBankId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [exams, total] = await Promise.all([
      prisma.exam.findMany({ where, include: examInclude, orderBy: { [query.sortBy]: query.sortOrder }, skip, take: query.limit }),
      prisma.exam.count({ where }),
    ]);
    return { exams, total };
  }

  async findExamById(id: string, tenantId: string, includeDeleted = false) {
    return prisma.exam.findFirst({ where: { id, tenantId, ...(includeDeleted ? {} : { deletedAt: null }) }, include: examInclude });
  }

  async updateExam(id: string, tenantId: string, data: UpdateExamDto) {
    const existing = await this.findExamById(id, tenantId);
    if (!existing) return null;
    return prisma.exam.update({ where: { tenantId_id: { tenantId, id } }, data: this.mapExamData(undefined, data), include: examInclude });
  }

  async softDeleteExam(id: string, tenantId: string): Promise<boolean> {
    const result = await prisma.exam.updateMany({ where: { id, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
    return result.count > 0;
  }

  async restoreExam(id: string, tenantId: string) {
    const result = await prisma.exam.updateMany({ where: { id, tenantId, deletedAt: { not: null } }, data: { deletedAt: null } });
    return result.count ? this.findExamById(id, tenantId) : null;
  }

  async questionExists(questionId: string, tenantId: string): Promise<boolean> {
    return (await prisma.question.count({ where: { id: questionId, tenantId, deletedAt: null } })) > 0;
  }

  async assignQuestion(examId: string, tenantId: string, data: AssignQuestionDto) {
    return prisma.questionPool.upsert({
      where: { tenantId_examId_questionId: { tenantId, examId, questionId: data.questionId } },
      update: { deletedAt: null, points: data.points, sortOrder: data.sortOrder },
      create: { tenantId, examId, questionId: data.questionId, points: data.points, sortOrder: data.sortOrder },
      select: questionPoolSelect,
    });
  }

  async listExamQuestions(examId: string, tenantId: string) {
    return prisma.questionPool.findMany({ where: { examId, tenantId, deletedAt: null }, select: questionPoolSelect, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  }

  async removeQuestion(examId: string, poolId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.questionPool.updateMany({ where: { id: poolId, examId, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
    return result.count > 0;
  }

  async reorderQuestions(examId: string, tenantId: string, questions: ReorderExamQuestionDto[]) {
    return prisma.$transaction(async (transaction) => {
      await Promise.all(questions.map((question) => transaction.questionPool.updateMany({ where: { id: question.poolId, examId, tenantId, deletedAt: null }, data: { sortOrder: question.sortOrder } })));
      return transaction.questionPool.findMany({ where: { examId, tenantId, deletedAt: null }, select: questionPoolSelect, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    });
  }

  async findActiveAttempt(examId: string, userId: string, tenantId: string) {
    return prisma.examAttempt.findFirst({ where: { examId, userId, tenantId, deletedAt: null, status: "in_progress" }, select: attemptSelect });
  }

  async countAttempts(examId: string, userId: string, tenantId: string): Promise<number> {
    return prisma.examAttempt.count({ where: { examId, userId, tenantId, deletedAt: null } });
  }

  async createAttempt(examId: string, userId: string, tenantId: string, attemptNumber: number) {
    return prisma.examAttempt.create({ data: { tenantId, examId, userId, attemptNumber }, select: attemptSelect });
  }

  async findAttemptById(attemptId: string, userId: string | null, tenantId: string) {
    const attempt = await prisma.examAttempt.findFirst({ where: { id: attemptId, tenantId, deletedAt: null, ...(userId ? { userId } : {}) }, select: attemptSelect });
    if (!attempt) return null;
    const [answers, result] = await Promise.all([
      prisma.studentAnswer.findMany({ where: { examAttemptId: attemptId, tenantId, deletedAt: null }, select: answerSelect, orderBy: { createdAt: "asc" } }),
      prisma.examResult.findFirst({ where: { examAttemptId: attemptId, tenantId, deletedAt: null }, select: resultSelect }),
    ]);
    return { attempt, answers, result };
  }

  async saveAnswer(attemptId: string, userId: string, tenantId: string, data: SaveAnswerDto) {
    return prisma.studentAnswer.upsert({
      where: { tenantId_examAttemptId_questionId: { tenantId, examAttemptId: attemptId, questionId: data.questionId } },
      update: { answerText: data.answerText, selectedChoiceIds: data.selectedChoiceIds ?? [] },
      create: { tenantId, examAttemptId: attemptId, questionId: data.questionId, userId, answerText: data.answerText, selectedChoiceIds: data.selectedChoiceIds ?? [] },
      select: answerSelect,
    });
  }

  async clearAnswer(attemptId: string, answerId: string, userId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.studentAnswer.updateMany({ where: { id: answerId, examAttemptId: attemptId, userId, tenantId, deletedAt: null }, data: { answerText: null, selectedChoiceIds: [], isCorrect: null, pointsAwarded: null } });
    return result.count > 0;
  }

  async submitAttempt(attemptId: string, userId: string, tenantId: string, status: string) {
    await prisma.examAttempt.updateMany({ where: { id: attemptId, userId, tenantId, deletedAt: null, status: "in_progress" }, data: { status, submittedAt: new Date() } });
    return this.findAttemptById(attemptId, userId, tenantId);
  }

  async updateAttemptScore(attemptId: string, tenantId: string, score: number): Promise<void> {
    await prisma.examAttempt.updateMany({ where: { id: attemptId, tenantId, deletedAt: null }, data: { score } });
  }

  async upsertResult(attemptId: string, tenantId: string, score: number, maxScore: number, passed: boolean) {
    const attempt = await prisma.examAttempt.findFirstOrThrow({ where: { id: attemptId, tenantId }, select: { examId: true, userId: true } });
    return prisma.examResult.upsert({
      where: { tenantId_examAttemptId: { tenantId, examAttemptId: attemptId } },
      update: { score, maxScore, passed, gradedAt: new Date() },
      create: { tenantId, examAttemptId: attemptId, examId: attempt.examId, userId: attempt.userId, score, maxScore, passed, gradedAt: new Date() },
      select: resultSelect,
    });
  }

  async gradeAnswer(answerId: string, tenantId: string, data: ManualGradeAnswerDto) {
    const existing = await prisma.studentAnswer.findFirst({ where: { id: answerId, tenantId, deletedAt: null }, select: { id: true } });
    if (!existing) return null;
    return prisma.studentAnswer.update({ where: { id: existing.id }, data, select: answerSelect });
  }

  async getResult(attemptId: string, userId: string | null, tenantId: string) {
    return prisma.examResult.findFirst({ where: { examAttemptId: attemptId, tenantId, deletedAt: null, ...(userId ? { userId } : {}) }, select: resultSelect });
  }

  async getStatistics(tenantId: string) {
    const [totalExams, examGroups, totalAttempts, attemptGroups, resultAgg, passedResults] = await Promise.all([
      prisma.exam.count({ where: { tenantId, deletedAt: null } }),
      prisma.exam.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.examAttempt.count({ where: { tenantId, deletedAt: null } }),
      prisma.examAttempt.groupBy({ by: ["status"], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      prisma.examResult.aggregate({ where: { tenantId, deletedAt: null }, _count: { id: true }, _avg: { score: true } }),
      prisma.examResult.count({ where: { tenantId, deletedAt: null, passed: true } }),
    ]);
    return { totalExams, examsByStatus: examGroups.map((g) => ({ status: g.status, count: g._count.id })), totalAttempts, attemptsByStatus: attemptGroups.map((g) => ({ status: g.status, count: g._count.id })), totalResults: resultAgg._count.id, passedResults, averageScore: Math.round(resultAgg._avg.score ?? 0) };
  }

  private mapExamData(tenantId: string | undefined, data: CreateExamDto | UpdateExamDto) {
    return { ...(tenantId ? { tenantId } : {}), ...data, startsAt: data.startsAt ? new Date(data.startsAt) : data.startsAt, endsAt: data.endsAt ? new Date(data.endsAt) : data.endsAt };
  }
}
