"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("@clerk/express");
const express_2 = require("express");
const uuid_1 = require("uuid");
const supabase_1 = require("../lib/supabase");
const ai_1 = __importDefault(require("../services/ai"));
const router = (0, express_2.Router)();
router.post("/generate-suggestions", (0, express_1.requireAuth)(), async (req, res) => {
    try {
        const userProfile = req.body.userProfile;
        if (!userProfile) {
            return res.status(400).json({ error: "User profile is required" });
        }
        const suggestions = await ai_1.default.generatePromptSuggestions(userProfile);
        return res.json(suggestions);
    }
    catch (error) {
        console.error("Error generating prompt suggestions:", error);
        return res.status(500).json({ error: "Failed to generate suggestions" });
    }
});
router.post("/revise-suggestion", (0, express_1.requireAuth)(), async (req, res) => {
    try {
        const { prompt, response, evaluation, feedback } = req.body;
        if (!prompt || !response || !evaluation || !feedback) {
            return res
                .status(400)
                .json({ error: "Missing required fields for revision" });
        }
        const revised = await ai_1.default.revisePromptSuggestion(prompt, response, evaluation, feedback);
        return res.json(revised);
    }
    catch (error) {
        console.error("Error revising prompt suggestion:", error);
        return res.status(500).json({ error: "Failed to revise suggestion" });
    }
});
router.post("/evaluate-custom", (0, express_1.requireAuth)(), async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { prompt, response } = req.body;
        if (!prompt || !response) {
            return res
                .status(400)
                .json({ error: "Prompt and response are required" });
        }
        console.log(`Using AI Service: ${process.env.AI_SERVICE_PROVIDER || "mock"}`);
        const evaluation = await ai_1.default.evaluateUserPrompt(prompt, response);
        return res.json(evaluation);
    }
    catch (error) {
        console.error("Error evaluating user prompt:", error);
        return res.status(500).json({ error: "Failed to evaluate user prompt" });
    }
});
router.post("/revise-custom", (0, express_1.requireAuth)(), async (req, res) => {
    try {
        const { prompt, response, evaluation, suggestions } = req.body;
        if (!prompt || !response || !evaluation || !suggestions) {
            return res
                .status(400)
                .json({ error: "Missing required fields for revision" });
        }
        const revised = await ai_1.default.reviseUserPrompt(prompt, response, evaluation, suggestions);
        return res.json(revised);
    }
    catch (error) {
        console.error("Error revising user prompt:", error);
        return res.status(500).json({ error: "Failed to revise user prompt" });
    }
});
router.post("/generate", (0, express_1.requireAuth)(), async (req, res) => {
    const auth = (0, express_1.getAuth)(req);
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
        const { data: user } = await supabase_1.supabase
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
        const newPrompt = {
            id: (0, uuid_1.v4)(),
            userId: user.id,
            category,
            responseText,
            aiGenerated: promptType === "GENERATED",
            promptType: promptType,
            status: "ACTIVE",
        };
        const { data: savedPrompt, error } = await supabase_1.supabase
            .from("prompts")
            .insert([newPrompt])
            .select()
            .single();
        if (error)
            throw error;
        return res.json({
            message: "Prompt generated and saved successfully",
            userId: auth.userId,
            data: savedPrompt,
        });
    }
    catch (error) {
        console.error("Error generating prompt:", error);
        return res.status(500).json({
            error: true,
            message: "Failed to generate prompt",
        });
    }
});
router.get("/user", (0, express_1.requireAuth)(), async (req, res) => {
    const auth = (0, express_1.getAuth)(req);
    if (!auth.userId) {
        return res.status(401).json({
            error: true,
            message: "Authentication required",
        });
    }
    try {
        const { data: user } = await supabase_1.supabase
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
        const { data: prompts, error } = await supabase_1.supabase
            .from("prompts")
            .select("*")
            .eq("userId", user.id)
            .eq("status", "ACTIVE")
            .order("createdAt", { ascending: false });
        if (error)
            throw error;
        return res.json({
            message: "User prompts retrieved successfully",
            userId: auth.userId,
            data: prompts || [],
        });
    }
    catch (error) {
        console.error("Error fetching user prompts:", error);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch user prompts",
        });
    }
});
router.put("/:promptId", (0, express_1.requireAuth)(), async (req, res) => {
    const auth = (0, express_1.getAuth)(req);
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
        const { data: user } = await supabase_1.supabase
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
        const { data: updatedPrompt, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        return res.json({
            message: "Prompt updated successfully",
            userId: auth.userId,
            data: updatedPrompt,
        });
    }
    catch (error) {
        console.error("Error updating prompt:", error);
        return res.status(500).json({
            error: true,
            message: "Failed to update prompt",
        });
    }
});
router.post("/usage_record", (0, express_1.requireAuth)(), async (req, res) => {
    const auth = (0, express_1.getAuth)(req);
    const { promptId } = req.body;
    if (!auth.userId) {
        return res.status(401).json({
            error: true,
            message: "Authentication required",
        });
    }
    try {
        const { data: user } = await supabase_1.supabase
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
        const { data: savedPromptUsage, error } = await supabase_1.supabase
            .from("prompt_usage")
            .insert([newPromptUsage])
            .select()
            .single();
        if (error)
            throw error;
        return res.json({
            message: "Prompt usage record saved successfully",
            userId: auth.userId,
            data: savedPromptUsage,
        });
    }
    catch (error) {
        console.error("Error saving prompt usage record:", error);
        return res.status(500).json({
            error: true,
            message: "Failed to save prompt usage record",
        });
    }
});
exports.default = router;
//# sourceMappingURL=prompts.js.map