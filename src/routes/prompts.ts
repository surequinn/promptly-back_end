import { getAuth, requireAuth } from "@clerk/express";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";
import aiService from "../services/ai";

const router = Router();

// =============================================
// AI-Powered Routes
// =============================================

// Feature 1: Use AI to write a prompt (3 suggestions)
router.post("/generate-suggestions", requireAuth(), async (req, res) => {
  try {
    const userProfile = req.body.userProfile;
    if (!userProfile) {
      return res.status(400).json({ error: "User profile is required" });
    }
    const suggestions = await aiService.generatePromptSuggestions(userProfile);
    console.log("API /generate-suggestions result:", JSON.stringify(suggestions, null, 2));
    return res.json(suggestions);
  } catch (error) {
    console.error("Error generating prompt suggestions:", error);
    return res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

// Feature 1.1: Revise an AI-generated prompt
router.post("/revise-suggestion", requireAuth(), async (req, res) => {
  try {
    const { prompt, response, evaluation, feedback } = req.body;
    if (!prompt || !response || !evaluation || !feedback) {
      return res
        .status(400)
        .json({ error: "Missing required fields for revision" });
    }
    const revised = await aiService.revisePromptSuggestion(
      prompt,
      response,
      evaluation,
      feedback
    );
    console.log("API /revise-suggestion result:", JSON.stringify(revised, null, 2));
    return res.json(revised);
  } catch (error) {
    console.error("Error revising prompt suggestion:", error);
    return res.status(500).json({ error: "Failed to revise suggestion" });
  }
});

// Feature 2: Evaluate a user's own response
router.post("/evaluate-custom", requireAuth(), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { prompt, response } = req.body;
    if (!prompt || !response) {
      return res
        .status(400)
        .json({ error: "Prompt and response are required" });
    }
    console.log(
      `Using AI Service: ${process.env.AI_SERVICE_PROVIDER || "mock"}`
    );
    const evaluation = await aiService.evaluateUserPrompt(prompt, response);
    console.log("API /evaluate-custom result:", JSON.stringify(evaluation, null, 2));
    return res.json(evaluation);
  } catch (error) {
    console.error("Error evaluating user prompt:", error);
    return res.status(500).json({ error: "Failed to evaluate user prompt" });
  }
});

// Feature 2.1: Revise a user's evaluated response
router.post("/revise-custom", requireAuth(), async (req, res) => {
  try {
    const { prompt, response, evaluation, suggestions } = req.body;
    if (!prompt || !response || !evaluation || !suggestions) {
      return res
        .status(400)
        .json({ error: "Missing required fields for revision" });
    }
    const revised = await aiService.reviseUserPrompt(
      prompt,
      response,
      evaluation,
      suggestions
    );
    console.log("API /revise-custom result:", JSON.stringify(revised, null, 2));
    return res.json(revised);
  } catch (error) {
    console.error("Error revising user prompt:", error);
    return res.status(500).json({ error: "Failed to revise user prompt" });
  }
});

// =============================================
// Existing Database Routes
// =============================================

// Generate prompts endpoint (requires authentication)
router.post("/generate", requireAuth(), async (req, res) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      error: true,
      message: "Authentication required",
    });
  }

  try {
    const { category, responseText, promptType = "GENERATED" } = req.body;

    if (!category || !responseText) {
      return res.status(400).json({
        error: true,
        message: "Category and response text are required",
      });
    }

    // Get user's database ID
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerkUserId", auth.userId)
      .single();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    // Save prompt to database
    const newPrompt = {
      id: uuidv4(),
      userId: user.id,
      category,
      responseText,
      aiGenerated: promptType === "GENERATED",
      promptType: promptType as "GENERATED" | "USER_WRITTEN" | "EDITED",
      status: "ACTIVE" as const,
    };

    const { data: savedPrompt, error } = await supabase
      .from("prompts")
      .insert([newPrompt])
      .select()
      .single();

    if (error) throw error;

    const result = {
      message: "Prompt generated and saved successfully",
      userId: auth.userId,
      data: savedPrompt,
    };
    console.log("API /generate result:", JSON.stringify(result, null, 2));
    return res.json(result);
  } catch (error) {
    console.error("Error generating prompt:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to generate prompt",
    });
  }
});

// Get user's saved prompts (requires authentication)
router.get("/user", requireAuth(), async (req, res) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      error: true,
      message: "Authentication required",
    });
  }

  try {
    // Get user's database ID
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("clerkUserId", auth.userId)
      .single();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    // Get user's prompts
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("userId", user.id)
      .eq("status", "ACTIVE")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const result = {
      message: "User prompts retrieved successfully",
      userId: auth.userId,
      data: prompts || [],
    };
    console.log("API /user result:", JSON.stringify(result, null, 2));
    return res.json(result);
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch user prompts",
    });
  }
});

// Update/edit a prompt
router.put("/:promptId", requireAuth(), async (req, res) => {
  const auth = getAuth(req);
  const { promptId } = req.params;

  if (!auth.userId) {
    return res.status(401).json({
      error: true,
      message: "Authentication required",
    });
  }

  try {
    const { responseText } = req.body;

    if (!responseText) {
      return res.status(400).json({
        error: true,
        message: "Response text is required",
      });
    }

    // Get user's database ID
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerkUserId", auth.userId)
      .single();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    // Update prompt
    const { data: updatedPrompt, error } = await supabase
      .from("prompts")
      .update({
        responseText,
        promptType: "EDITED",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", promptId)
      .eq("userId", user.id)
      .select()
      .single();

    if (error) throw error;

    const result = {
      message: "Prompt updated successfully",
      userId: auth.userId,
      data: updatedPrompt,
    };
    console.log("API /:promptId (PUT) result:", JSON.stringify(result, null, 2));
    return res.json(result);
  } catch (error) {
    console.error("Error updating prompt:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to update prompt",
    });
  }
});

// post a prompt usage record to supabase
router.post("/usage_record", requireAuth(), async (req, res) => {
  const auth = getAuth(req);
  const { promptId } = req.body;

  if (!auth.userId) {
    return res.status(401).json({
      error: true,
      message: "Authentication required",
    });
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerkUserId", auth.userId)
      .single();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const newPromptUsage = {
      promptId,
      operation_user: auth.userId,
    };

    const { data: savedPromptUsage, error } = await supabase
      .from("prompt_usage")
      .insert([newPromptUsage])
      .select()
      .single();

    if (error) throw error;

    const result = {
      message: "Prompt usage record saved successfully",
      userId: auth.userId,
      data: savedPromptUsage,
    };
    console.log("API /usage_record result:", JSON.stringify(result, null, 2));
    return res.json(result);
  } catch (error) {
    console.error("Error saving prompt usage record:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to save prompt usage record",
    });
  }
});

export default router;
