export type SortOrder = "asc" | "desc";
export type AssignmentSortBy = "createdAt" | "updatedAt" | "title" | "status" | "dueAt";

export interface CreateAssignmentDto { courseId: string; lessonId?: string | null; title: string; description?: string | null; instructions?: string | null; status?: string; dueAt?: string | null; maxScore?: number | null }
export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {}
export interface AssignmentListQueryDto { page: number; limit: number; search?: string; courseId?: string; lessonId?: string; status?: string; includeDeleted?: boolean; sortBy: AssignmentSortBy; sortOrder: SortOrder }
export interface AssignmentDto { id: string; courseId: string; lessonId: string | null; createdById: string | null; title: string; description: string | null; instructions: string | null; status: string; dueAt: string | null; maxScore: number | null; submissionCount: number; rubricCount: number; deletedAt: string | null; createdAt: string; updatedAt: string }
export interface AssignmentsListDto { assignments: AssignmentDto[]; total: number; page: number; limit: number }

export interface SubmissionFileInputDto { fileName: string; fileUrl: string; fileType?: string | null; fileSize?: number | null }
export interface CreateSubmissionDto { content?: string | null; files?: SubmissionFileInputDto[] }
export interface UpdateSubmissionDto { content?: string | null; status?: string; files?: SubmissionFileInputDto[] }
export interface SubmissionFileDto { id: string; submissionId: string; fileName: string; fileUrl: string; fileType: string | null; fileSize: number | null; createdAt: string; updatedAt: string }
export interface SubmissionDto { id: string; assignmentId: string; userId: string; content: string | null; status: string; submittedAt: string; files: SubmissionFileDto[]; grade: GradeDto | null; createdAt: string; updatedAt: string }

export interface GradeSubmissionDto { score: number; maxScore: number; feedback?: string | null }
export interface GradeDto { id: string; submissionId: string; studentId: string; graderId: string | null; score: number; maxScore: number; feedback: string | null; gradedAt: string | null; createdAt: string; updatedAt: string }
export interface CreateRubricDto { title: string; description?: string | null; maxScore: number; sortOrder?: number }
export interface UpdateRubricDto extends Partial<CreateRubricDto> {}
export interface RubricDto { id: string; assignmentId: string; title: string; description: string | null; maxScore: number; sortOrder: number; createdAt: string; updatedAt: string }

export interface CreateCertificateTemplateDto { name: string; content: string; isDefault?: boolean }
export interface UpdateCertificateTemplateDto extends Partial<CreateCertificateTemplateDto> {}
export interface CertificateTemplateDto { id: string; name: string; content: string; isDefault: boolean; createdAt: string; updatedAt: string }
export interface GenerateCertificateDto { courseId: string; userId: string; templateId?: string | null; expiresAt?: string | null }
export interface CertificateDto { id: string; courseId: string; userId: string; templateId: string | null; certificateNumber: string; issuedAt: string; expiresAt: string | null; revokedAt: string | null; verificationCode: string | null; createdAt: string; updatedAt: string }
export interface CertificateListQueryDto { page: number; limit: number; courseId?: string; userId?: string; templateId?: string; includeRevoked?: boolean }
export interface CertificatesListDto { certificates: CertificateDto[]; total: number; page: number; limit: number }

export interface LearningOperationsStatisticsDto { totalAssignments: number; assignmentsByStatus: Array<{ status: string; count: number }>; totalSubmissions: number; submissionsByStatus: Array<{ status: string; count: number }>; totalGrades: number; averageGradeScore: number; totalCertificates: number; revokedCertificates: number; totalTemplates: number }
