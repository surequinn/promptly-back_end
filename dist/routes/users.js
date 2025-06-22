"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("@clerk/express");
const express_2 = require("express");
const supabase_1 = require("../lib/supabase");
const router = (0, express_2.Router)();
router.get("/profile", (0, express_1.requireAuth)(), async (req, res) => {
    const auth = (0, express_1.getAuth)(req);
    if (!auth.userId) {
        return res.status(401).json({
            error: true,
            message: "Authentication required",
        });
    }
    try {
        const { data: user, error } = await supabase_1.supabase
            .from("users")
            .select("*")
            .eq("clerkUserId", auth.userId)
            .single();
        if (error && error.code !== "PGRST116") {
            throw error;
        }
        if (!user) {
            const newUser = {
                id: auth.userId,
                clerkUserId: auth.userId,
                email: auth.sessionClaims?.email || null,
                profileCompleted: false,
            };
            const { data: createdUser, error: createError } = await supabase_1.supabase
                .from("users")
                .insert([newUser])
                .select()
                .single();
            if (createError)
                throw createError;
            return res.json({
                message: "User profile retrieved",
                userId: auth.userId,
                data: createdUser,
            });
        }
        return res.json({
            message: "User profile retrieved",
            userId: auth.userId,
            data: user,
        });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch user profile",
        });
    }
});
router.put("/profile", (0, express_1.requireAuth)(), async (req, res) => {
    const auth = (0, express_1.getAuth)(req);
    if (!auth.userId) {
        return res.status(401).json({
            error: true,
            message: "Authentication required",
        });
    }
    try {
        const { name, age, gender, orientation, selectedVibes, interests, uniqueInterest, profileCompleted, } = req.body;
        const { data: updatedUser, error } = await supabase_1.supabase
            .from("users")
            .update({
            name,
            age,
            gender,
            orientation,
            selectedVibes,
            interests,
            uniqueInterest,
            profileCompleted,
            updatedAt: new Date().toISOString(),
        })
            .eq("clerkUserId", auth.userId)
            .select()
            .single();
        if (error)
            throw error;
        return res.json({
            message: "User profile updated successfully",
            userId: auth.userId,
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            error: true,
            message: "Failed to update user profile",
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map