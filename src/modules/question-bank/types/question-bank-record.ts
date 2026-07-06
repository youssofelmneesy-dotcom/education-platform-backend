export interface ChoiceRecord {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionPoolRecord {
  id: string;
  examId: string;
  questionId: string;
  points: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  exam: {
    courseId: string;
    lessonId: string | null;
  };
}

export interface QuestionRecord {
  id: string;
  questionBankId: string;
  createdById: string | null;
  type: string;
  prompt: string;
  explanation: string | null;
  points: number;
  sortOrder: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  questionBank: {
    courseId: string | null;
  };
  choices: ChoiceRecord[];
  questionPools: QuestionPoolRecord[];
}
