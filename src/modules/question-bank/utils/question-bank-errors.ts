import { AppError } from "../../../shared/errors/index.js";

export class QuestionNotFoundError extends AppError {
  constructor() {
    super("Question not found", 404, "QUESTION_NOT_FOUND");
  }
}

export class QuestionBankNotFoundError extends AppError {
  constructor() {
    super("Question bank not found", 404, "QUESTION_BANK_NOT_FOUND");
  }
}

export class ChoiceNotFoundError extends AppError {
  constructor() {
    super("Choice not found", 404, "CHOICE_NOT_FOUND");
  }
}

export class ExamNotFoundError extends AppError {
  constructor() {
    super("Exam not found", 404, "EXAM_NOT_FOUND");
  }
}

export class QuestionPoolNotFoundError extends AppError {
  constructor() {
    super("Question pool entry not found", 404, "QUESTION_POOL_NOT_FOUND");
  }
}

export class MultipleCorrectChoicesError extends AppError {
  constructor() {
    super("Only one correct choice is supported for a question", 422, "MULTIPLE_CORRECT_CHOICES_NOT_SUPPORTED");
  }
}
