import dotenv from "dotenv";

// Load test env variables as early as possible
dotenv.config({ path: "./env.test" });

// Ensure NODE_ENV=test
process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
