"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("@clerk/express");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
dotenv_1.default.config();
const requiredEnvVars = ["CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
const health_1 = __importDefault(require("./routes/health"));
const prompts_1 = __importDefault(require("./routes/prompts"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_2.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://promptly-frontend-green.vercel.app",
            "https://promptly-front-hhihbvekx-quinns-projects-3ee04bc1.vercel.app",
            "http://localhost:8081",
            "http://192.168.2.171:8081",
            "http://localhost:8083",
            "http://192.168.2.171:8083",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_2.default.json({ limit: "10mb" }));
app.use(express_2.default.urlencoded({ extended: true }));
app.use((0, express_1.clerkMiddleware)({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
}));
app.use("/api/health", health_1.default);
app.use("/api/prompts", prompts_1.default);
app.use("/api/users", users_1.default);
app.use((err, req, res, next) => {
    console.error("Error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        error: true,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});
app.get("/", (req, res) => {
    res.send("Promptly API is running");
});
app.use("*", (req, res) => {
    res.status(404).json({
        error: true,
        message: "Route not found",
    });
});
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Promptly API server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`📱 Frontend URL: ${process.env.FRONTEND_PUBLIC_API_URL || "http://localhost:8081"}`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map