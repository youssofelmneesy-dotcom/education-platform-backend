import { AppError } from "../../../shared/errors/index.js";
export class AssignmentNotFoundError extends AppError { constructor() { super("Assignment not found", 404, "ASSIGNMENT_NOT_FOUND"); } }
export class SubmissionNotFoundError extends AppError { constructor() { super("Submission not found", 404, "SUBMISSION_NOT_FOUND"); } }
export class GradeNotFoundError extends AppError { constructor() { super("Grade not found", 404, "GRADE_NOT_FOUND"); } }
export class RubricNotFoundError extends AppError { constructor() { super("Rubric not found", 404, "RUBRIC_NOT_FOUND"); } }
export class CertificateTemplateNotFoundError extends AppError { constructor() { super("Certificate template not found", 404, "CERTIFICATE_TEMPLATE_NOT_FOUND"); } }
export class CertificateNotFoundError extends AppError { constructor() { super("Certificate not found", 404, "CERTIFICATE_NOT_FOUND"); } }
export class CertificateVerificationNotFoundError extends AppError { constructor() { super("Certificate verification not found", 404, "CERTIFICATE_VERIFICATION_NOT_FOUND"); } }
export class RelatedLearningResourceNotFoundError extends AppError { constructor() { super("Related learning resource not found", 404, "RELATED_LEARNING_RESOURCE_NOT_FOUND"); } }
export class SubmissionAlreadyExistsError extends AppError { constructor() { super("Submission already exists for this assignment", 409, "SUBMISSION_ALREADY_EXISTS"); } }
