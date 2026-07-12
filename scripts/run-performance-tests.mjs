import dotenv from "dotenv";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const nodeBin = process.platform === "win32" ? "npx.cmd" : "npx";
const k6Bin = process.platform === "win32" ? "k6.exe" : "k6";
const scripts = [
  "tests/performance/auth.register.k6.js",
  "tests/performance/auth.login.k6.js",
  "tests/performance/auth.refresh.k6.js",
  "tests/performance/auth.logout.k6.js",
];

function loadEnv() {
  dotenv.config({ path: resolve(root, "env.test") });
  process.env.NODE_ENV = "test";
  process.env.BASE_URL = `http://127.0.0.1:${process.env.PORT ?? 4001}`;
}

function spawnProcess(command, args) {
  return spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env },
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
  for (let attempt = 1; attempt <= 30; attempt += 1) {
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
    const versionCheck = spawnSync(k6Bin, ["version"], { cwd: root, stdio: "ignore" });
    if (versionCheck.status !== 0) {
      throw new Error("k6 is not installed or not available on PATH. Install k6 to run performance tests.");
    }

    await waitForServer(baseUrl);

    for (const script of scripts) {
      const k6 = spawnProcess(k6Bin, ["run", "--summary-trend-stats", "avg,min,med,p(90),p(95),p(99)", resolve(root, script)]);
      await waitForExit(k6);
    }
  } finally {
    cleanup();
  }
}

run().catch((error) => {
  globalThis.console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
