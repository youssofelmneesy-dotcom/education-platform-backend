import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";

import { assessmentRouter } from "./modules/assessments/routes/index.js";
import { authRouter } from "./modules/auth/routes/index.js";
import { categoriesRouter } from "./modules/categories/routes/index.js";
import { commerceRouter } from "./modules/commerce/routes/index.js";
import { coursesRouter } from "./modules/courses/routes/index.js";
import { learningOperationsRouter } from "./modules/learning-operations/routes/index.js";
import { lessonAttachmentsRouter } from "./modules/lesson-attachments/routes/index.js";
import { lessonsRouter } from "./modules/lessons/routes/index.js";
import { videosRouter } from "./modules/videos/routes/index.js";
import { profilesRouter } from "./modules/profiles/routes/index.js";
import { questionBankRouter } from "./modules/question-bank/routes/index.js";
import { permissionsRouter } from "./modules/permissions/routes/index.js";
import { rolesRouter } from "./modules/roles/routes/index.js";
import { studentLearningRouter } from "./modules/student-learning/routes/index.js";
import { tagsRouter } from "./modules/tags/routes/index.js";
import { usersRouter } from "./modules/users/routes/index.js";
import { swaggerRouter } from "./docs/swagger.router.js";
import { prisma } from "./database/index.js";
import { httpConfig } from "./shared/config/index.js";
import { errorHandler, globalRateLimiter, notFoundHandler, requestId, requestLogger } from "./shared/middlewares/index.js";

const app = express();

app.set("trust proxy", httpConfig.trustProxy);

app.use(requestId);

// Disable verbose request logging in tests
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}
app.use(helmet());
app.use(cors(httpConfig.cors));
app.use(compression());
// Disable rate limiting during tests to avoid flakiness
if (process.env.NODE_ENV !== "test") {
  app.use(globalRateLimiter);
}
app.use(express.json({ limit: httpConfig.requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: httpConfig.urlencodedBodyLimit }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/courses", lessonsRouter);
app.use("/api/lesson-attachments", lessonAttachmentsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/learning", studentLearningRouter);
app.use("/api/question-bank", questionBankRouter);
app.use("/api/assessments", assessmentRouter);
app.use("/api/learning-operations", learningOperationsRouter);
app.use("/api/commerce", commerceRouter);
app.use("/api", swaggerRouter);

// Health Check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Education Platform Backend API is running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.get("/live", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "live",
  });
});

app.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      status: "ready",
    });
  } catch {
    res.status(503).json({
      success: false,
      status: "not_ready",
    });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
