import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface User {
  id: string;
  clerkUserId: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
  orientation?: string[];
  selectedVibes?: string[];
  interests?: string[];
  uniqueInterest?: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  userId: string;
  category: string;
  responseText: string;
  aiGenerated: boolean;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
  promptType: "GENERATED" | "USER_WRITTEN" | "EDITED";
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  promptId: string;
  score: string;
  explanation: any;
  createdAt: string;
  updatedAt: string;
}
