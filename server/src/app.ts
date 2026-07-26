import cors from "cors";
import express from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import { pingDatabase } from "./infrastructure/database.js";
import { walletRoutes } from "./modules/wallets/wallet.routes.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { requestContext } from "./shared/middleware/requestContext.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openApiDocument = JSON.parse(
  readFileSync(path.join(__dirname, "..", "openapi.json"), "utf8")
) as Record<string, unknown>;

export function createApp() {
  const app = express();

  app.use(requestContext);
  app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ data: { ok: true } });
  });

  app.get("/api/ready", (_req, res) => {
    try {
      pingDatabase();
      res.json({ data: { ready: true } });
    } catch {
      res.status(503).json({ error: { message: "Database unavailable" } });
    }
  });

  app.get("/api/openapi.json", (_req, res) => {
    res.type("application/json").send(openApiDocument);
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/api/wallets", walletRoutes);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: { message: "Not found" } });
  });

  app.use(errorHandler);

  return app;
}
