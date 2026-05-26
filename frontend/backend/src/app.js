import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { waterRouter } from "./routes/waterRoutes.js";
import { alertRouter } from "./routes/alertRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
    }),
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "Flood Monitoring Backend",
      version: "1.0.0",
      docs: "/api/health",
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/waters", waterRouter);
  app.use("/api/alerts", alertRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/users", userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
