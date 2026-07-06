export interface ChoiceRecord { id: string; content: string; isCorrect: boolean; sortOrder: number }
export interface QuestionRecord { id: string; type: string; prompt: string; choices: ChoiceRecord[] }
export interface ExamQuestionRecord {
  id: string; examId: string; questionId: string; points: number; sortOrder: number; createdAt: Date; updatedAt: Date; question: QuestionRecord;
}
export interface ExamRecord {
  id: string; courseId: string; lessonId: string | null; questionBankId: string | null; title: string; description: string | null; status: string;
  timeLimitMinutes: number | null; passingScore: number | null; maxAttempts: number | null; startsAt: Date | null; endsAt: Date | null;
  deletedAt: Date | null; createdAt: Date; updatedAt: Date; questionPools: Array<{ points: number }>;
}
export interface ExamAttemptRecord {
  id: string; examId: string; userId: string; attemptNumber: number; status: string; startedAt: Date; submittedAt: Date | null; score: number | null; createdAt: Date; updatedAt: Date;
}
export interface StudentAnswerRecord {
  id: string; examAttemptId: string; questionId: string; userId: string; answerText: string | null; selectedChoiceIds: string[]; isCorrect: boolean | null; pointsAwarded: number | null; createdAt: Date; updatedAt: Date;
}
export interface ExamResultRecord {
  id: string; examId: string; examAttemptId: string; userId: string; score: number; maxScore: number; passed: boolean; gradedAt: Date | null; createdAt: Date; updatedAt: Date;
}
export interface AttemptReviewRecord { attempt: ExamAttemptRecord; result: ExamResultRecord | null; answers: StudentAnswerRecord[] }
