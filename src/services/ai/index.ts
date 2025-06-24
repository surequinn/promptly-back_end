import { MockAIService } from "./mock";
import { OpenAIService } from "./openai";

export interface AIService {
  generatePromptSuggestions(userProfile: any): Promise<any>;
  generatePromptSuggestionsForPrompt(userProfile: any, selectedPrompt: string): Promise<any>;
  revisePromptSuggestion(
    prompt: string,
    response: string,
    evaluation: any,
    feedback: string
  ): Promise<any>;
  evaluateUserPrompt(prompt: string, response: string): Promise<any>;
  reviseUserPrompt(
    prompt: string,
    response: string,
    evaluation: any,
    suggestions: string[]
  ): Promise<any>;
}

const aiServiceProvider = process.env.AI_SERVICE_PROVIDER || "mock";

let aiService: AIService;

switch (aiServiceProvider) {
  case "openai":
    aiService = new OpenAIService();
    break;
  default:
    aiService = new MockAIService();
}

export default aiService;
