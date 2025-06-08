import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "promptly-api",
    version: "1.0.0",
  });
});

export default router;
