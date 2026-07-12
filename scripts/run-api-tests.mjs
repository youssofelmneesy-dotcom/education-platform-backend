import dotenv from "dotenv";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const mode = (process.argv[2] ?? "cli").toLowerCase();
const isHtmlMode = mode === "html";
const nodeBin = process.platform === "win32" ? "npx.cmd" : "npx";

function loadEnv() {
  dotenv.config({ path: resolve(root, "env.test") });
  process.env.NODE_ENV = "test";
  process.env.BASE_URL = `http://127.0.0.1:${process.env.PORT ?? 4001}`;
}

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...options.env },
    cwd: root,
    shell: false,
  });
}

function waitForExit(child) {
  return new Promise((resolvePromise, rejectPromise) => {
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Process exited with code ${code ?? "unknown"}${signal ? ` signal ${signal}` : ""}`));
    });

    child.on("error", rejectPromise);
  });
}

async function waitForServer(baseUrl) {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await globalThis.fetch(baseUrl, { method: "GET" });

      if (response.ok) {
        return;
      }
    } catch {
      // ignore and retry
    }

    await delay(1000);
  }

  throw new Error(`API server did not become ready at ${baseUrl}`);
}

async function run() {
  loadEnv();

  const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4001";
  const collectionPath = resolve(root, "postman", "Education Platform API.postman_collection.json");
  const environmentPath = resolve(root, "postman", "Education Platform Local.postman_environment.json");
  const reportsDir = resolve(root, "newman", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const server = spawnProcess(nodeBin, ["tsx", "src/server.ts"]);
  const cleanup = () => {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });

  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  try {
    await waitForServer(baseUrl);

    const reporterArgs = isHtmlMode
      ? ["cli", "junit", "htmlextra"]
      : ["cli", "junit"];

    const newmanArgs = [
      "newman",
      "run",
      collectionPath,
      "-e",
      environmentPath,
      "-r",
      reporterArgs.join(","),
      "--reporter-junit-export",
      resolve(reportsDir, "education-platform-api.junit.xml"),
    ];

    if (isHtmlMode) {
      newmanArgs.push("--reporter-htmlextra-export", resolve(reportsDir, "education-platform-api.html"));
    }

    const newman = spawnProcess(nodeBin, newmanArgs);
    await waitForExit(newman);
  } finally {
    cleanup();
  }
}

run().catch((error) => {
  globalThis.console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
