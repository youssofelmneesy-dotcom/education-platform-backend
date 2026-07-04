import express from "express";

const app = express();

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Education Platform Backend API is running 🚀",
  });
});

export default app;
