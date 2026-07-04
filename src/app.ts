import express from "express";

import { authRouter } from "./modules/auth/routes/index.js";

const app = express();

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

// Health Check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Education Platform Backend API is running 🚀",
  });
});

export default app;
