import express from "express";

import { authRouter } from "./modules/auth/routes/index.js";
import { categoriesRouter } from "./modules/categories/routes/index.js";
import { profilesRouter } from "./modules/profiles/routes/index.js";
import { permissionsRouter } from "./modules/permissions/routes/index.js";
import { rolesRouter } from "./modules/roles/routes/index.js";
import { tagsRouter } from "./modules/tags/routes/index.js";
import { usersRouter } from "./modules/users/routes/index.js";

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

// Health Check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Education Platform Backend API is running 🚀",
  });
});

export default app;
