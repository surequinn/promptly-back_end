import { AIService } from "./index";

const exampleGeneratedResponses = {
  responses: [
    {
      text: "I won't shut up about perfecting kimchi. Yes, it's a personality trait. Wanna try my spicy batch?",
      scores: {
        personality: 9,
        tone_fit: 9,
        brevity_clarity: 9,
        originality: 9,
        conversation_spark: 9,
      },
      explanations: {
        personality:
          "Strong personal voice, quirky detail, and food passion create an authentic and memorable impression.",
        tone_fit: "Confident, flirty, and casually funny—perfect for Hinge.",
        brevity_clarity: "Well within the word limit and easy to digest.",
        originality:
          "Kimchi fermentation is uncommon and gives this personality.",
        conversation_spark:
          "The question at the end naturally invites a reply.",
      },
      overall_score: 9.0,
      label: "🔥 Top-Tier",
    },
    {
      text: "I won't shut up about crying at Pixar movies like it's my cardio. I blame 'Up' every time.",
      scores: {
        personality: 8,
        tone_fit: 8,
        brevity_clarity: 9,
        originality: 8,
        conversation_spark: 7,
      },
      explanations: {
        personality:
          "The Pixar crying confession is relatable and adds emotional honesty with humor.",
        tone_fit:
          "Funny and self-aware, great for dating but slightly less flirty.",
        brevity_clarity: "Short, well-structured, and punchy.",
        originality: "Pixar tears are familiar but 'cardio' twist adds flavor.",
        conversation_spark:
          "No direct question, but definitely opens room for shared confessions.",
      },
      overall_score: 8.1,
      label: "🟢 Great Potential",
    },
    {
      text: "I won't shut up about learning to play tennis in Tokyo with a matcha latte in hand—dangerous combo?",
      scores: {
        personality: 8,
        tone_fit: 8,
        brevity_clarity: 8,
        originality: 9,
        conversation_spark: 9,
      },
      explanations: {
        personality:
          "Travel, tennis, and humor combined create a vivid and interesting personality snapshot.",
        tone_fit: "Playful with a hint of absurdity—charming and bold.",
        brevity_clarity:
          "Slightly longer but still within range and cleanly written.",
        originality:
          "Tokyo tennis with matcha is delightfully weird and fresh.",
        conversation_spark: "The rhetorical question works as a fun hook.",
      },
      overall_score: 8.3,
      label: "🟢 Great Potential",
    },
  ],
};

const exampleRevisedResponse =
  "I won't shut up about fermenting everything from carrots to miso. Ever made your own pickles?";

const exampleEvaluation = {
  scores: {
    personality: 8,
    tone_fit: 8,
    brevity_clarity: 7,
    originality: 6,
    conversation_spark: 6,
  },
  explanations: {
    personality:
      "The response feels warm and genuine, giving a clear glimpse into your lifestyle and priorities like early routines and your pup.",
    tone_fit:
      "Tone is casual and dating-appropriate—friendly, easygoing, and welcoming.",
    brevity_clarity:
      "It's slightly wordy but still easy to read and understand.",
    originality:
      "Coffee runs and beach walks are pleasant but fairly common; it could use a more unique or specific twist.",
    conversation_spark:
      "It paints a nice picture but doesn't explicitly invite engagement or follow-up.",
  },
  overall_score: 7.2,
  label: "🟡 Room to Grow",
  suggestions: [
    "Add a specific detail—like your favorite beach or your pup's name—to help it stand out.",
    "Try ending with a light question like 'Too much morning energy for you?' to spark a reply.",
  ],
};

const exampleImprovedResponse =
  "I'm looking for someone who's down for sunrise matcha walks on Venice Beach with Max—too much morning energy for you?";

export class MockAIService implements AIService {
  async generatePromptSuggestions(userProfile: any): Promise<any> {
    console.log("Mock AI: Generating prompt suggestions for", userProfile);
    // In a real scenario, the first AI call to choose a prompt would happen here.
    // For the mock, we just return the example responses directly.
    return Promise.resolve(exampleGeneratedResponses);
  }

  async revisePromptSuggestion(
    prompt: string,
    response: string,
    evaluation: any,
    feedback: string
  ): Promise<any> {
    console.log("Mock AI: Revising prompt suggestion with feedback:", feedback);
    return Promise.resolve({ revisedResponse: exampleRevisedResponse });
  }

  async evaluateUserPrompt(prompt: string, response: string): Promise<any> {
    console.log("Mock AI: Evaluating user prompt:", response);
    return Promise.resolve(exampleEvaluation);
  }

  async reviseUserPrompt(
    prompt: string,
    response: string,
    evaluation: any,
    suggestions: string[]
  ): Promise<any> {
    console.log("Mock AI: Revising user prompt with suggestions:", suggestions);
    return Promise.resolve({ revisedResponse: exampleImprovedResponse });
  }
}
