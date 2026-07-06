export type SortOrder = "asc" | "desc";
export type ExamSortBy = "createdAt" | "updatedAt" | "title" | "status" | "startsAt" | "endsAt";

export interface CreateExamDto {
  courseId: string;
  lessonId?: string | null;
  questionBankId?: string | null;
  title: string;
  description?: string | null;
  status?: string;
  timeLimitMinutes?: number | null;
  passingScore?: number | null;
  maxAttempts?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdateExamDto extends Partial<CreateExamDto> {}

export interface ExamListQueryDto {
  page: number;
  limit: number;
  search?: string;
  courseId?: string;
  lessonId?: string;
  questionBankId?: string;
  status?: string;
  includeDeleted?: boolean;
  sortBy: ExamSortBy;
  sortOrder: SortOrder;
}

export interface ExamDto {
  id: string;
  courseId: string;
  lessonId: string | null;
  questionBankId: string | null;
  title: string;
  description: string | null;
  status: string;
  timeLimitMinutes: number | null;
  passingScore: number | null;
  maxAttempts: number | null;
  startsAt: string | null;
  endsAt: string | null;
  questionCount: number;
  maxScore: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamsListDto {
  exams: ExamDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AssignQuestionDto {
  questionId: string;
  points?: number;
  sortOrder?: number;
}

export interface ReorderExamQuestionDto {
  poolId: string;
  sortOrder: number;
}

export interface ExamQuestionDto {
  id: string;
  examId: string;
  questionId: string;
  points: number;
  sortOrder: number;
  prompt: string;
  type: string;
  choices: Array<{ id: string; content: string; sortOrder: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface ExamAttemptDto {
  id: string;
  examId: string;
  userId: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAnswerDto {
  questionId: string;
  answerText?: string | null;
  selectedChoiceIds?: string[];
}

export interface StudentAnswerDto {
  id: string;
  examAttemptId: string;
  questionId: string;
  userId: string;
  answerText: string | null;
  selectedChoiceIds: string[];
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManualGradeAnswerDto {
  isCorrect?: boolean | null;
  pointsAwarded: number;
}

export interface ExamResultDto {
  id: string;
  examId: string;
  examAttemptId: string;
  userId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamReviewDto {
  attempt: ExamAttemptDto;
  result: ExamResultDto | null;
  answers: StudentAnswerDto[];
}

export interface AssessmentStatisticsDto {
  totalExams: number;
  examsByStatus: Array<{ status: string; count: number }>;
  totalAttempts: number;
  attemptsByStatus: Array<{ status: string; count: number }>;
  totalResults: number;
  passedResults: number;
  averageScore: number;
}
