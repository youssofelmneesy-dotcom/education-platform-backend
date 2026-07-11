import express from "express";

import { assessmentRouter } from "./modules/assessments/routes/index.js";
import { authRouter } from "./modules/auth/routes/index.js";
import { categoriesRouter } from "./modules/categories/routes/index.js";
import { coursesRouter } from "./modules/courses/routes/index.js";
import { learningOperationsRouter } from "./modules/learning-operations/routes/index.js";
import { lessonsRouter } from "./modules/lessons/routes/index.js";
import { videosRouter } from "./modules/videos/routes/index.js";
import { profilesRouter } from "./modules/profiles/routes/index.js";
import { questionBankRouter } from "./modules/question-bank/routes/index.js";
import { permissionsRouter } from "./modules/permissions/routes/index.js";
import { rolesRouter } from "./modules/roles/routes/index.js";
import { studentLearningRouter } from "./modules/student-learning/routes/index.js";
import { tagsRouter } from "./modules/tags/routes/index.js";
import { usersRouter } from "./modules/users/routes/index.js";
import { errorHandler } from "./shared/middlewares/index.js";

const app = express();

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/courses", lessonsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/learning", studentLearningRouter);
app.use("/api/question-bank", questionBankRouter);
app.use("/api/assessments", assessmentRouter);
app.use("/api/learning-operations", learningOperationsRouter);

// Health Check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Education Platform Backend API is running 🚀",
  });
});

app.use(errorHandler);

export default app;
