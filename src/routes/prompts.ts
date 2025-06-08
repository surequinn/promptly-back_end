import { getAuth, requireAuth } from "@clerk/express";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabase";

const router = Router();

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

    return res.json({
      message: "Prompt generated and saved successfully",
      userId: auth.userId,
      data: savedPrompt,
    });
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

    return res.json({
      message: "User prompts retrieved successfully",
      userId: auth.userId,
      data: prompts || [],
    });
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

    return res.json({
      message: "Prompt updated successfully",
      userId: auth.userId,
      data: updatedPrompt,
    });
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

    return res.json({
      message: "Prompt usage record saved successfully",
      userId: auth.userId,
      data: savedPromptUsage,
    });
  } catch (error) {
    console.error("Error saving prompt usage record:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to save prompt usage record",
    });
  }
});

export default router;
