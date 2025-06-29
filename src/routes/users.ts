import { getAuth, requireAuth } from "@clerk/express";
import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Get user profile (requires authentication)
router.get("/profile", requireAuth(), async (req, res) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      error: true,
      message: "Authentication required",
    });
  }

  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerkUserId", auth.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    if (!user) {
      // User doesn't exist in our database yet, create them
      const newUser = {
        id: auth.userId,
        clerkUserId: auth.userId,
        email: (auth.sessionClaims?.email as string) || null,
        profileCompleted: false,
      };

      const { data: createdUser, error: createError } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (createError) throw createError;

      const newUserResult = {
        message: "User profile retrieved",
        userId: auth.userId,
        data: createdUser,
      };
      console.log(
        "API /profile (GET, new user) result:",
        JSON.stringify(newUserResult, null, 2)
      );
      return res.json(newUserResult);
    }

    const existingUserResult = {
      message: "User profile retrieved",
      userId: auth.userId,
      data: user,
    };
    console.log(
      "API /profile (GET, existing user) result:",
      JSON.stringify(existingUserResult, null, 2)
    );
    return res.json(existingUserResult);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to fetch user profile",
    });
  }
});

// Update user profile (requires authentication)
router.put("/profile", requireAuth(), async (req, res) => {
  console.log("[BACKEND DEBUG] Received profile update request. Auth userId:", getAuth(req).userId);
  console.log("[BACKEND DEBUG] Full request body:", JSON.stringify(req.body, null, 2));
  
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      error: true,
      message: "Authentication required",
    });
  }

  try {
    const {
      name,
      age,
      gender,
      orientation,
      selectedVibes,
      interests,
      uniqueInterest,
      email,
      profileCompleted
    } = req.body;

    console.log("[BACKEND DEBUG] Extracted email from payload:", email);
    
    const updatePayload = {
          id: auth.userId,
          clerkUserId: auth.userId,
      email,
          name,
          age,
          gender,
          orientation,
          selectedVibes,
          interests,
          uniqueInterest,
          profileCompleted,
          updatedAt: new Date().toISOString(),
    };
    
    console.log("[BACKEND DEBUG] Preparing Supabase upsert with:", JSON.stringify(updatePayload, null, 2));
    
    const { data: updatedUser, error } = await supabase
      .from("users")
      .upsert(updatePayload, { onConflict: "clerkUserId" })
      .select()
      .single();

    if (error) {
      console.error("[BACKEND DEBUG] Supabase upsert error:", error);
      throw error;
    }
    
    console.log("[BACKEND DEBUG] Supabase upsert successful. Updated user:", JSON.stringify(updatedUser, null, 2));
    
    return res.json({
      message: "User profile updated successfully",
      userId: auth.userId,
      data: updatedUser,
    });
  } catch (error) {
    console.error("[BACKEND DEBUG] Profile update failed:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to update user profile",
    });
  }
});

export default router;
