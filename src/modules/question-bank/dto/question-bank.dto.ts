export type QuestionSortBy = "createdAt" | "updatedAt" | "sortOrder" | "points" | "type";
export type SortOrder = "asc" | "desc";

export interface CreateQuestionDto {
  questionBankId: string;
  type: string;
  prompt: string;
  explanation?: string | null;
  points?: number;
  sortOrder?: number;
  choices?: CreateChoiceDto[];
}

export interface UpdateQuestionDto {
  questionBankId?: string;
  type?: string;
  prompt?: string;
  explanation?: string | null;
  points?: number;
  sortOrder?: number;
}

export interface QuestionListQueryDto {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  questionBankId?: string;
  courseId?: string;
  lessonId?: string;
  examId?: string;
  sortBy: QuestionSortBy;
  sortOrder: SortOrder;
  includeDeleted?: boolean;
}

export interface CreateChoiceDto {
  content: string;
  isCorrect?: boolean;
  sortOrder?: number;
}

export interface UpdateChoiceDto {
  content?: string;
  isCorrect?: boolean;
  sortOrder?: number;
}

export interface ReorderChoiceDto {
  id: string;
  sortOrder: number;
}

export interface QuestionChoiceDto {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDto {
  id: string;
  questionBankId: string;
  courseId: string | null;
  createdById: string | null;
  type: string;
  prompt: string;
  explanation: string | null;
  points: number;
  sortOrder: number;
  choices: QuestionChoiceDto[];
  poolIds: string[];
  examIds: string[];
  lessonIds: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionsListDto {
  questions: QuestionDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AttachQuestionPoolDto {
  examId: string;
  points?: number;
  sortOrder?: number;
}

export interface QuestionPoolDto {
  id: string;
  examId: string;
  questionId: string;
  courseId: string;
  lessonId: string | null;
  points: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionStatisticsDto {
  totalQuestions: number;
  questionsByType: Array<{ type: string; count: number }>;
  questionsPerCourse: Array<{ courseId: string; count: number }>;
  questionsPerLesson: Array<{ lessonId: string; count: number }>;
}
