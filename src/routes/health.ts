import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    console.log("API /health result:", JSON.stringify(healthcheck, null, 2));
    res.send(healthcheck);
  } catch (e: any) {
    healthcheck.message = e;
    res.status(503).send();
  }
});

export default router;
