export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
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
//# sourceMappingURL=supabase.d.ts.map