import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { checkBlockchainConnectivity } from "./config/blockchain";
import { isUsingRealFirebase, checkStorageAvailability } from "./config/firebase";

// Import route modules
import authRoutes from "./routes/auth.routes";
import applicationRoutes from "./routes/applications.routes";
import recordRoutes from "./routes/records.routes";
import transferRoutes from "./routes/transfers.routes";
import auditRoutes from "./routes/audit.routes";
import notificationRoutes from "./routes/notifications.routes";
import agentRoutes from "./routes/agent.routes";

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, test suites)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes("*") ||
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app") ||
          process.env.NODE_ENV !== "production"
        ) {
          return callback(null, true);
        }
        return callback(new Error("CORS policy violation: origin not allowed"), false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Demo-Role", "X-Demo-Uid", "X-Demo-Wallet"],
    })
  );

  // Request logger
  app.use(morgan("dev"));

  // Body parsers
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // General rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, please try again later." },
  });
  app.use("/api", limiter);

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    const blockchainStatus = await checkBlockchainConnectivity();
    const storageStatus = await checkStorageAvailability();
    res.json({
      status: "HEALTHY",
      service: "LandChain Academic API",
      timestamp: new Date().toISOString(),
      databaseMode: isUsingRealFirebase ? "FIREBASE_CLOUD" : "IN_MEMORY_DEMO",
      storageMode: storageStatus.status,
      storage: {
        enabled: storageStatus.enabled,
        status: storageStatus.status,
        bucket: storageStatus.bucket,
        message: storageStatus.message,
      },
      blockchain: blockchainStatus,
      version: "1.0.0",
    });
  });

  // Mount API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/records", recordRoutes);
  app.use("/api/transfers", transferRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/agent", agentRoutes);

  // Alias for digital land certificate download
  app.get("/api/certificates/:landId", (req, res) => {
    res.redirect(302, `/api/records/${req.params.landId}/certificate`);
  });

  // 404 Route Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `API route '${req.method} ${req.originalUrl}' not found.`,
      code: "NOT_FOUND",
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
