import { prisma } from "../../../database/index.js";
import type { AttachQuestionPoolDto, CreateChoiceDto, CreateQuestionDto, QuestionListQueryDto, ReorderChoiceDto, UpdateChoiceDto, UpdateQuestionDto } from "../dto/index.js";
import type { IQuestionBankRepository } from "../interfaces/index.js";

const questionInclude = {
  questionBank: { select: { courseId: true } },
  choices: {
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    select: { id: true, questionId: true, content: true, isCorrect: true, sortOrder: true, createdAt: true, updatedAt: true },
  },
  questionPools: {
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      examId: true,
      questionId: true,
      points: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      exam: { select: { courseId: true, lessonId: true } },
    },
  },
};

const choiceSelect = {
  id: true,
  questionId: true,
  content: true,
  isCorrect: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
};

const poolSelect = {
  id: true,
  examId: true,
  questionId: true,
  points: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  exam: { select: { courseId: true, lessonId: true } },
};

export class QuestionBankRepository implements IQuestionBankRepository {
  async questionBankExists(questionBankId: string, tenantId: string): Promise<boolean> {
    return (await prisma.questionBank.count({ where: { id: questionBankId, tenantId, deletedAt: null } })) > 0;
  }

  async examExists(examId: string, tenantId: string): Promise<boolean> {
    return (await prisma.exam.count({ where: { id: examId, tenantId, deletedAt: null } })) > 0;
  }

  async createQuestion(tenantId: string, createdById: string | null, data: CreateQuestionDto) {
    return prisma.question.create({
      data: {
        tenantId,
        createdById,
        questionBankId: data.questionBankId,
        type: data.type,
        prompt: data.prompt,
        explanation: data.explanation,
        points: data.points,
        sortOrder: data.sortOrder,
        choices: data.choices?.length
          ? {
              create: data.choices.map((choice) => ({
                tenantId,
                content: choice.content,
                isCorrect: choice.isCorrect,
                sortOrder: choice.sortOrder,
              })),
            }
          : undefined,
      },
      include: questionInclude,
    });
  }

  async listQuestions(tenantId: string, query: QuestionListQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      tenantId,
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.search ? { prompt: { contains: query.search, mode: "insensitive" as const } } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.questionBankId ? { questionBankId: query.questionBankId } : {}),
      ...(query.courseId ? { OR: [{ questionBank: { courseId: query.courseId } }, { questionPools: { some: { deletedAt: null, exam: { courseId: query.courseId } } } }] } : {}),
      ...(query.lessonId ? { questionPools: { some: { deletedAt: null, exam: { lessonId: query.lessonId } } } } : {}),
      ...(query.examId ? { questionPools: { some: { deletedAt: null, examId: query.examId } } } : {}),
    };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: questionInclude,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take: query.limit,
      }),
      prisma.question.count({ where }),
    ]);

    return { questions, total };
  }

  async findQuestionById(id: string, tenantId: string, includeDeleted = false) {
    return prisma.question.findFirst({
      where: { id, tenantId, ...(includeDeleted ? {} : { deletedAt: null }) },
      include: questionInclude,
    });
  }

  async updateQuestion(id: string, tenantId: string, data: UpdateQuestionDto) {
    const existing = await this.findQuestionById(id, tenantId);

    if (!existing) {
      return null;
    }

    return prisma.question.update({
      where: { tenantId_id: { tenantId, id } },
      data,
      include: questionInclude,
    });
  }

  async softDeleteQuestion(id: string, tenantId: string): Promise<boolean> {
    const result = await prisma.question.updateMany({
      where: { id, tenantId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return result.count > 0;
  }

  async restoreQuestion(id: string, tenantId: string) {
    const result = await prisma.question.updateMany({
      where: { id, tenantId, deletedAt: { not: null } },
      data: { deletedAt: null },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findQuestionById(id, tenantId);
  }

  async createChoice(questionId: string, tenantId: string, data: CreateChoiceDto) {
    const question = await this.findQuestionById(questionId, tenantId);

    if (!question) {
      return null;
    }

    return prisma.$transaction(async (transaction) => {
      if (data.isCorrect) {
        await transaction.choice.updateMany({ where: { tenantId, questionId, deletedAt: null }, data: { isCorrect: false } });
      }

      return transaction.choice.create({
        data: { tenantId, questionId, content: data.content, isCorrect: data.isCorrect, sortOrder: data.sortOrder },
        select: choiceSelect,
      });
    });
  }

  async updateChoice(questionId: string, choiceId: string, tenantId: string, data: UpdateChoiceDto) {
    const choice = await prisma.choice.findFirst({ where: { id: choiceId, questionId, tenantId, deletedAt: null }, select: { id: true } });

    if (!choice) {
      return null;
    }

    return prisma.$transaction(async (transaction) => {
      if (data.isCorrect) {
        await transaction.choice.updateMany({ where: { tenantId, questionId, deletedAt: null, id: { not: choice.id } }, data: { isCorrect: false } });
      }

      return transaction.choice.update({ where: { id: choice.id }, data, select: choiceSelect });
    });
  }

  async deleteChoice(questionId: string, choiceId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.choice.updateMany({
      where: { id: choiceId, questionId, tenantId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return result.count > 0;
  }

  async reorderChoices(questionId: string, tenantId: string, choices: ReorderChoiceDto[]) {
    return prisma.$transaction(async (transaction) => {
      await Promise.all(
        choices.map((choice) =>
          transaction.choice.updateMany({
            where: { id: choice.id, questionId, tenantId, deletedAt: null },
            data: { sortOrder: choice.sortOrder },
          })
        )
      );

      return transaction.choice.findMany({
        where: { questionId, tenantId, deletedAt: null },
        select: choiceSelect,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
    });
  }

  async markCorrectChoice(questionId: string, choiceId: string, tenantId: string) {
    const choice = await prisma.choice.findFirst({ where: { id: choiceId, questionId, tenantId, deletedAt: null }, select: { id: true } });

    if (!choice) {
      return null;
    }

    return prisma.$transaction(async (transaction) => {
      await transaction.choice.updateMany({ where: { tenantId, questionId, deletedAt: null, id: { not: choice.id } }, data: { isCorrect: false } });
      return transaction.choice.update({ where: { id: choice.id }, data: { isCorrect: true }, select: choiceSelect });
    });
  }

  async attachToPool(questionId: string, tenantId: string, data: AttachQuestionPoolDto) {
    return prisma.questionPool.upsert({
      where: { tenantId_examId_questionId: { tenantId, examId: data.examId, questionId } },
      update: { deletedAt: null, points: data.points, sortOrder: data.sortOrder },
      create: { tenantId, examId: data.examId, questionId, points: data.points, sortOrder: data.sortOrder },
      select: poolSelect,
    });
  }

  async listPools(questionId: string, tenantId: string) {
    return prisma.questionPool.findMany({
      where: { questionId, tenantId, deletedAt: null },
      select: poolSelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  async removeFromPool(questionId: string, poolId: string, tenantId: string): Promise<boolean> {
    const result = await prisma.questionPool.updateMany({
      where: { id: poolId, questionId, tenantId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return result.count > 0;
  }

  async getStatistics(tenantId: string) {
    const [totalQuestions, typeGroups, questions] = await Promise.all([
      prisma.question.count({ where: { tenantId, deletedAt: null } }),
      prisma.question.groupBy({
        by: ["type"],
        where: { tenantId, deletedAt: null },
        _count: { id: true },
      }),
      prisma.question.findMany({
        where: { tenantId, deletedAt: null },
        select: {
          questionBank: { select: { courseId: true } },
          questionPools: {
            where: { deletedAt: null },
            select: { exam: { select: { courseId: true, lessonId: true } } },
          },
        },
      }),
    ]);

    const courseCounts = new Map<string, number>();
    const lessonCounts = new Map<string, number>();

    for (const question of questions) {
      const courseIds = new Set<string>();
      if (question.questionBank.courseId) {
        courseIds.add(question.questionBank.courseId);
      }

      for (const pool of question.questionPools) {
        courseIds.add(pool.exam.courseId);
        if (pool.exam.lessonId) {
          lessonCounts.set(pool.exam.lessonId, (lessonCounts.get(pool.exam.lessonId) ?? 0) + 1);
        }
      }

      for (const courseId of courseIds) {
        courseCounts.set(courseId, (courseCounts.get(courseId) ?? 0) + 1);
      }
    }

    return {
      totalQuestions,
      questionsByType: typeGroups.map((group) => ({ type: group.type, count: group._count.id })),
      questionsPerCourse: [...courseCounts.entries()].map(([courseId, count]) => ({ courseId, count })),
      questionsPerLesson: [...lessonCounts.entries()].map(([lessonId, count]) => ({ lessonId, count })),
    };
  }
}
