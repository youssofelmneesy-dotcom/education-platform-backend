import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware, requirePermissions } from "../../auth/middleware/index.js";
import { QuestionBankController } from "../controllers/index.js";
import {
  attachQuestionPoolSchema,
  createChoiceSchema,
  createQuestionSchema,
  markCorrectChoiceSchema,
  questionChoiceParamsSchema,
  questionIdParamsSchema,
  questionListQuerySchema,
  questionPoolParamsSchema,
  reorderChoicesSchema,
  updateChoiceSchema,
  updateQuestionSchema,
} from "../validators/index.js";

export const questionBankRouter = Router();
export const questionBankController = new QuestionBankController();

questionBankRouter.use(authMiddleware);

questionBankRouter.get("/questions/statistics", requirePermissions("question-bank:read"), asyncHandler(questionBankController.getStatistics));
questionBankRouter.get("/questions", requirePermissions("question-bank:list"), validate({ query: questionListQuerySchema }), asyncHandler(questionBankController.listQuestions));
questionBankRouter.post("/questions", requirePermissions("question-bank:create"), validate({ body: createQuestionSchema }), asyncHandler(questionBankController.createQuestion));
questionBankRouter.get("/questions/:id", requirePermissions("question-bank:read"), validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.getQuestionById));
questionBankRouter.patch("/questions/:id", requirePermissions("question-bank:update"), validate({ params: questionIdParamsSchema, body: updateQuestionSchema }), asyncHandler(questionBankController.updateQuestion));
questionBankRouter.delete("/questions/:id", requirePermissions("question-bank:delete"), validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.deleteQuestion));
questionBankRouter.post("/questions/:id/restore", requirePermissions("question-bank:update"), validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.restoreQuestion));

questionBankRouter.post("/questions/:id/choices", requirePermissions("question-bank:update"), validate({ params: questionIdParamsSchema, body: createChoiceSchema }), asyncHandler(questionBankController.createChoice));
questionBankRouter.patch(
  "/questions/:id/choices/reorder",
  requirePermissions("question-bank:update"),
  validate({ params: questionIdParamsSchema, body: reorderChoicesSchema }),
  asyncHandler(questionBankController.reorderChoices)
);
questionBankRouter.patch(
  "/questions/:id/choices/correct",
  requirePermissions("question-bank:update"),
  validate({ params: questionIdParamsSchema, body: markCorrectChoiceSchema }),
  asyncHandler(questionBankController.markCorrectChoice)
);
questionBankRouter.patch(
  "/questions/:id/choices/:choiceId",
  requirePermissions("question-bank:update"),
  validate({ params: questionChoiceParamsSchema, body: updateChoiceSchema }),
  asyncHandler(questionBankController.updateChoice)
);
questionBankRouter.delete("/questions/:id/choices/:choiceId", requirePermissions("question-bank:update"), validate({ params: questionChoiceParamsSchema }), asyncHandler(questionBankController.deleteChoice));

questionBankRouter.get("/questions/:id/pools", requirePermissions("question-bank:read"), validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.listPools));
questionBankRouter.post("/questions/:id/pools", requirePermissions("question-bank:update"), validate({ params: questionIdParamsSchema, body: attachQuestionPoolSchema }), asyncHandler(questionBankController.attachToPool));
questionBankRouter.delete("/questions/:id/pools/:poolId", requirePermissions("question-bank:update"), validate({ params: questionPoolParamsSchema }), asyncHandler(questionBankController.removeFromPool));
