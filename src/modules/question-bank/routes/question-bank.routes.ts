import { Router } from "express";

import { validate } from "../../../shared/middlewares/index.js";
import { asyncHandler } from "../../../shared/utils/index.js";
import { authMiddleware } from "../../auth/middleware/index.js";
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

questionBankRouter.get("/questions/statistics", asyncHandler(questionBankController.getStatistics));
questionBankRouter.get("/questions", validate({ query: questionListQuerySchema }), asyncHandler(questionBankController.listQuestions));
questionBankRouter.post("/questions", validate({ body: createQuestionSchema }), asyncHandler(questionBankController.createQuestion));
questionBankRouter.get("/questions/:id", validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.getQuestionById));
questionBankRouter.patch("/questions/:id", validate({ params: questionIdParamsSchema, body: updateQuestionSchema }), asyncHandler(questionBankController.updateQuestion));
questionBankRouter.delete("/questions/:id", validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.deleteQuestion));
questionBankRouter.post("/questions/:id/restore", validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.restoreQuestion));

questionBankRouter.post("/questions/:id/choices", validate({ params: questionIdParamsSchema, body: createChoiceSchema }), asyncHandler(questionBankController.createChoice));
questionBankRouter.patch(
  "/questions/:id/choices/reorder",
  validate({ params: questionIdParamsSchema, body: reorderChoicesSchema }),
  asyncHandler(questionBankController.reorderChoices)
);
questionBankRouter.patch(
  "/questions/:id/choices/correct",
  validate({ params: questionIdParamsSchema, body: markCorrectChoiceSchema }),
  asyncHandler(questionBankController.markCorrectChoice)
);
questionBankRouter.patch(
  "/questions/:id/choices/:choiceId",
  validate({ params: questionChoiceParamsSchema, body: updateChoiceSchema }),
  asyncHandler(questionBankController.updateChoice)
);
questionBankRouter.delete("/questions/:id/choices/:choiceId", validate({ params: questionChoiceParamsSchema }), asyncHandler(questionBankController.deleteChoice));

questionBankRouter.get("/questions/:id/pools", validate({ params: questionIdParamsSchema }), asyncHandler(questionBankController.listPools));
questionBankRouter.post("/questions/:id/pools", validate({ params: questionIdParamsSchema, body: attachQuestionPoolSchema }), asyncHandler(questionBankController.attachToPool));
questionBankRouter.delete("/questions/:id/pools/:poolId", validate({ params: questionPoolParamsSchema }), asyncHandler(questionBankController.removeFromPool));
