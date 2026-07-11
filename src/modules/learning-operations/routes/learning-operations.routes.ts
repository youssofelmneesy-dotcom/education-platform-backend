import { Router } from "express";
import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
import { LearningOperationsController } from "../controllers/index.js";
import {
  assignmentIdParamsSchema,
  assignmentListQuerySchema,
  certificateListQuerySchema,
  certificateNumberParamsSchema,
  createAssignmentSchema,
  createCertificateTemplateSchema,
  createRubricSchema,
  createSubmissionSchema,
  generateCertificateSchema,
  gradeSubmissionSchema,
  idParamsSchema,
  updateAssignmentSchema,
  updateCertificateTemplateSchema,
  updateRubricSchema,
  updateSubmissionSchema,
  verificationCodeParamsSchema,
} from "../validators/index.js";

export const learningOperationsRouter = Router();
export const learningOperationsController = new LearningOperationsController();
learningOperationsRouter.use(authMiddleware);
learningOperationsRouter.get("/statistics", asyncHandler(learningOperationsController.getStatistics));
learningOperationsRouter.get("/assignments", validate({ query: assignmentListQuerySchema }), asyncHandler(learningOperationsController.listAssignments));
learningOperationsRouter.post("/assignments", validate({ body: createAssignmentSchema }), asyncHandler(learningOperationsController.createAssignment));
learningOperationsRouter.get("/assignments/:id", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.getAssignment));
learningOperationsRouter.patch("/assignments/:id", validate({ params: idParamsSchema, body: updateAssignmentSchema }), asyncHandler(learningOperationsController.updateAssignment));
learningOperationsRouter.delete("/assignments/:id", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.deleteAssignment));
learningOperationsRouter.post("/assignments/:id/restore", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.restoreAssignment));
learningOperationsRouter.post("/assignments/:assignmentId/submissions", validate({ params: assignmentIdParamsSchema, body: createSubmissionSchema }), asyncHandler(learningOperationsController.createSubmission));
learningOperationsRouter.get("/assignments/:assignmentId/submissions", validate({ params: assignmentIdParamsSchema }), asyncHandler(learningOperationsController.listAssignmentSubmissions));
learningOperationsRouter.post("/assignments/:assignmentId/rubrics", validate({ params: assignmentIdParamsSchema, body: createRubricSchema }), asyncHandler(learningOperationsController.createRubric));
learningOperationsRouter.get("/assignments/:assignmentId/rubrics", validate({ params: assignmentIdParamsSchema }), asyncHandler(learningOperationsController.listRubrics));
learningOperationsRouter.patch("/assignments/:assignmentId/rubrics/:id", validate({ params: assignmentIdParamsSchema.merge(idParamsSchema), body: updateRubricSchema }), asyncHandler(learningOperationsController.updateRubric));
learningOperationsRouter.delete("/assignments/:assignmentId/rubrics/:id", validate({ params: assignmentIdParamsSchema.merge(idParamsSchema) }), asyncHandler(learningOperationsController.deleteRubric));
learningOperationsRouter.get("/submissions/me", asyncHandler(learningOperationsController.listMySubmissions));
learningOperationsRouter.get("/submissions/:id", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.getSubmission));
learningOperationsRouter.patch("/submissions/:id", validate({ params: idParamsSchema, body: updateSubmissionSchema }), asyncHandler(learningOperationsController.updateSubmission));
learningOperationsRouter.post("/submissions/:id/submit", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.submitSubmission));
learningOperationsRouter.post("/submissions/:id/grade", validate({ params: idParamsSchema, body: gradeSubmissionSchema }), asyncHandler(learningOperationsController.gradeSubmission));
learningOperationsRouter.post("/certificate-templates", validate({ body: createCertificateTemplateSchema }), asyncHandler(learningOperationsController.createTemplate));
learningOperationsRouter.get("/certificate-templates", asyncHandler(learningOperationsController.listTemplates));
learningOperationsRouter.patch("/certificate-templates/:id", validate({ params: idParamsSchema, body: updateCertificateTemplateSchema }), asyncHandler(learningOperationsController.updateTemplate));
learningOperationsRouter.delete("/certificate-templates/:id", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.deleteTemplate));
learningOperationsRouter.post("/certificates", validate({ body: generateCertificateSchema }), asyncHandler(learningOperationsController.generateCertificate));
learningOperationsRouter.get("/certificates", validate({ query: certificateListQuerySchema }), asyncHandler(learningOperationsController.listCertificates));
learningOperationsRouter.get("/certificates/:certificateNumber", validate({ params: certificateNumberParamsSchema }), asyncHandler(learningOperationsController.getCertificate));
learningOperationsRouter.post("/certificates/:id/revoke", validate({ params: idParamsSchema }), asyncHandler(learningOperationsController.revokeCertificate));
learningOperationsRouter.get("/certificate-verifications/:verificationCode", validate({ params: verificationCodeParamsSchema }), asyncHandler(learningOperationsController.verifyCertificate));
