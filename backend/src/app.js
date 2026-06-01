import express from "express";
import cors from "cors";

import healthRouter from "./routes/health.js";
import tasksRouter from "./routes/tasks.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";

export function createApp() {
  const app = express();

  const corsOriginRaw = String(process.env.CORS_ORIGIN || "").trim();
  const corsOrigins = corsOriginRaw
    ? corsOriginRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  // If CORS_ORIGIN is unset, default to permissive CORS for local dev.
  app.use(cors(corsOrigins ? { origin: corsOrigins } : undefined));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/tasks", requireAuth, tasksRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = Number.isInteger(err?.status) ? err.status : 500;
    const message =
      status >= 500 ? "Internal Server Error" : err?.message || "Error";
    res.status(status).json({ error: message });
  });

  return app;
}
