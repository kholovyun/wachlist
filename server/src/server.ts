import { createApp } from "./app.js";
import { closeDatabase } from "./infrastructure/database.js";
import { logger } from "./shared/logger.js";

const PORT = Number(process.env.PORT) || 4000;
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info("server_started", {
    port: PORT,
    docs: `http://localhost:${PORT}/api/docs`,
  });
});

function shutdown(signal: string) {
  logger.info("shutdown_started", { signal });
  server.close(() => {
    try {
      closeDatabase();
      logger.info("shutdown_complete");
      process.exit(0);
    } catch (err) {
      logger.error("shutdown_failed", {
        err: err instanceof Error ? err.message : err,
      });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("shutdown_timeout");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
