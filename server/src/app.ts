import cors from "cors";
import express from "express";
import { walletRoutes } from "./modules/wallets/wallet.routes.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ data: { ok: true } });
  });
  app.use("/api/wallets", walletRoutes);
  app.use(errorHandler);
  return app;
}
