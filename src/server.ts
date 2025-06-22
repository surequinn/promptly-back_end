import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Import routes
import healthRoutes from "./routes/health";
import promptRoutes from "./routes/prompts";
import userRoutes from "./routes/users";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - allow all origins in development
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://promptly-front-end.vercel.app",
        "https://promptly-frontend-green.vercel.app",
        "https://promptly-front-hhihbvekx-quinns-projects-3ee04bc1.vercel.app",
        "http://localhost:8081",
        "http://192.168.2.171:8081",
        "http://localhost:8083",
        "http://192.168.2.171:8083",
        // add more preview URLs if needed
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Clerk authentication middleware
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  })
);

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/users", userRoutes);

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      error: true,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// root route
app.get("/", (req, res) => {
  res.send("Promptly API is running");
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Promptly API server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `📱 Frontend URL: ${
        process.env.FRONTEND_PUBLIC_API_URL || "http://localhost:8081"
      }`
    );
  });
}

export default app;
