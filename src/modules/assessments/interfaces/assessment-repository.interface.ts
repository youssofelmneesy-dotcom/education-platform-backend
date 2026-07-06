import type { AssignQuestionDto, CreateExamDto, ExamListQueryDto, ManualGradeAnswerDto, ReorderExamQuestionDto, SaveAnswerDto, UpdateExamDto } from "../dto/index.js";
import type { AttemptReviewRecord, ExamAttemptRecord, ExamQuestionRecord, ExamRecord, ExamResultRecord, StudentAnswerRecord } from "../types/index.js";

export interface IAssessmentRepository {
  relatedResourcesExist(tenantId: string, data: { courseId?: string; lessonId?: string | null; questionBankId?: string | null }): Promise<boolean>;
  createExam(tenantId: string, data: CreateExamDto): Promise<ExamRecord>;
  listExams(tenantId: string, query: ExamListQueryDto): Promise<{ exams: ExamRecord[]; total: number }>;
  findExamById(id: string, tenantId: string, includeDeleted?: boolean): Promise<ExamRecord | null>;
  updateExam(id: string, tenantId: string, data: UpdateExamDto): Promise<ExamRecord | null>;
  softDeleteExam(id: string, tenantId: string): Promise<boolean>;
  restoreExam(id: string, tenantId: string): Promise<ExamRecord | null>;
  questionExists(questionId: string, tenantId: string): Promise<boolean>;
  assignQuestion(examId: string, tenantId: string, data: AssignQuestionDto): Promise<ExamQuestionRecord>;
  listExamQuestions(examId: string, tenantId: string): Promise<ExamQuestionRecord[]>;
  removeQuestion(examId: string, poolId: string, tenantId: string): Promise<boolean>;
  reorderQuestions(examId: string, tenantId: string, questions: ReorderExamQuestionDto[]): Promise<ExamQuestionRecord[]>;
  findActiveAttempt(examId: string, userId: string, tenantId: string): Promise<ExamAttemptRecord | null>;
  countAttempts(examId: string, userId: string, tenantId: string): Promise<number>;
  createAttempt(examId: string, userId: string, tenantId: string, attemptNumber: number): Promise<ExamAttemptRecord>;
  findAttemptById(attemptId: string, userId: string | null, tenantId: string): Promise<AttemptReviewRecord | null>;
  saveAnswer(attemptId: string, userId: string, tenantId: string, data: SaveAnswerDto): Promise<StudentAnswerRecord>;
  clearAnswer(attemptId: string, answerId: string, userId: string, tenantId: string): Promise<boolean>;
  submitAttempt(attemptId: string, userId: string, tenantId: string, status: string): Promise<AttemptReviewRecord | null>;
  updateAttemptScore(attemptId: string, tenantId: string, score: number): Promise<void>;
  upsertResult(attemptId: string, tenantId: string, score: number, maxScore: number, passed: boolean): Promise<ExamResultRecord>;
  gradeAnswer(answerId: string, tenantId: string, data: ManualGradeAnswerDto): Promise<StudentAnswerRecord | null>;
  getResult(attemptId: string, userId: string | null, tenantId: string): Promise<ExamResultRecord | null>;
  getStatistics(tenantId: string): Promise<{ totalExams: number; examsByStatus: Array<{ status: string; count: number }>; totalAttempts: number; attemptsByStatus: Array<{ status: string; count: number }>; totalResults: number; passedResults: number; averageScore: number }>;
}
