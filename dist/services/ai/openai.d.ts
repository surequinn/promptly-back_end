import { AIService } from "./index";
export declare class OpenAIService implements AIService {
    generatePromptSuggestions(userProfile: any): Promise<any>;
    revisePromptSuggestion(prompt: string, response: string, evaluation: any, feedback: string): Promise<any>;
    evaluateUserPrompt(prompt: string, response: string): Promise<any>;
    reviseUserPrompt(prompt: string, response: string, evaluation: any, suggestions: string[]): Promise<any>;
}
//# sourceMappingURL=openai.d.ts.map