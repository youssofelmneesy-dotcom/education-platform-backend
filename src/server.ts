import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./database/index.js";
import { logger } from "./shared/utils/index.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info("Server started", { port: PORT, nodeEnv: env.NODE_ENV });
});

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info("Shutdown signal received", { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close((error) => {
    void (async () => {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        logger.error("Failed to disconnect Prisma during shutdown", {
          error: disconnectError instanceof Error ? disconnectError.message : "Unknown disconnect error",
        });
      } finally {
        clearTimeout(forceExitTimer);
      }

      if (error) {
        logger.error("HTTP server shutdown failed", { error: error.message });
        process.exit(1);
      }

      logger.info("Shutdown completed", { signal });
      process.exit(0);
    })();
  });
}

process.on("SIGTERM", (signal) => {
  void shutdown(signal);
});

process.on("SIGINT", (signal) => {
  void shutdown(signal);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error && env.NODE_ENV !== "production" ? reason.stack : undefined,
  });
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    error: error.message,
    stack: env.NODE_ENV !== "production" ? error.stack : undefined,
  });
  void shutdown("SIGTERM");
});
