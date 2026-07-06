import { AppError } from "../../../shared/errors/index.js";

export class ExamNotFoundError extends AppError { constructor() { super("Exam not found", 404, "EXAM_NOT_FOUND"); } }
export class QuestionNotFoundError extends AppError { constructor() { super("Question not found", 404, "QUESTION_NOT_FOUND"); } }
export class ExamQuestionNotFoundError extends AppError { constructor() { super("Exam question not found", 404, "EXAM_QUESTION_NOT_FOUND"); } }
export class ExamAttemptNotFoundError extends AppError { constructor() { super("Exam attempt not found", 404, "EXAM_ATTEMPT_NOT_FOUND"); } }
export class StudentAnswerNotFoundError extends AppError { constructor() { super("Student answer not found", 404, "STUDENT_ANSWER_NOT_FOUND"); } }
export class ExamResultNotFoundError extends AppError { constructor() { super("Exam result not found", 404, "EXAM_RESULT_NOT_FOUND"); } }
export class RelatedAssessmentResourceNotFoundError extends AppError { constructor(message = "Related assessment resource not found") { super(message, 404, "RELATED_ASSESSMENT_RESOURCE_NOT_FOUND"); } }
export class ActiveAttemptExistsError extends AppError { constructor() { super("An active attempt already exists for this exam", 409, "ACTIVE_ATTEMPT_EXISTS"); } }
export class MaxAttemptsReachedError extends AppError { constructor() { super("Maximum attempts reached for this exam", 403, "MAX_ATTEMPTS_REACHED"); } }
export class ExamUnavailableError extends AppError { constructor() { super("Exam is not currently available", 403, "EXAM_UNAVAILABLE"); } }
export class AttemptNotActiveError extends AppError { constructor() { super("Exam attempt is not active", 422, "ATTEMPT_NOT_ACTIVE"); } }
