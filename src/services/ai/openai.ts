import OpenAI from "openai";
import { AIService } from "./index";

// Define a helper function for making OpenAI API calls
const callOpenAI = async (
  systemContent: string,
  userContent: string,
  isJsonMode = false
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
    model: "gpt-4o",
    response_format: isJsonMode ? { type: "json_object" } : undefined,
  });

  const responseContent = chatCompletion.choices[0].message.content;
  if (!responseContent) {
    throw new Error("No content received from OpenAI.");
  }

  if (isJsonMode) {
    return JSON.parse(responseContent);
  }

  return responseContent;
};

export class OpenAIService implements AIService {
  /**
   * Feature 1: Use AI to write a prompt (3 suggestions)
   */
  async generatePromptSuggestions(userProfile: any): Promise<any> {
    // Step 1: Choose the best Hinge prompt
    const choosePromptSystem = `You are an AI dating assistant that helps users create standout responses for their dating profile on apps like Hinge. Your first job is to choose one prompt from the following Prompt options that best matches the user's input, including tone preferences, interests, and something specific that the user loves. 

Use the following input:
- Dating app: Hinge
- User's gender: ${userProfile.gender}
- Target gender: ${userProfile.targetGender}
- Desired tones: ${userProfile.tones.join(", ")}
- User interests: ${userProfile.interests.join(", ")}
- Something specific the user loves: ${userProfile.specificLove}

Prompt options:
- Dating me is like
- My simple pleasures
- The way to win me over is
- Typical Sunday
- I won't shut up about
- If loving this is wrong, I don't want to be right
- Teach me something about
- I'll pick the topic if you start the conversation
- Together, we could
- I'll fall for you if
- We'll get along if

Pick a prompt that gives the user the best opportunity to stand out on dating apps like Hinge. Return ONLY the chosen prompt.`;

    const chosenPrompt = await callOpenAI(
      choosePromptSystem,
      JSON.stringify(userProfile)
    );

    // Step 2: Generate 3 responses for the chosen prompt
    const generateResponsesSystem = `You are an AI dating assistant who generates and evaluates creative, personalized answers to dating app prompts (like Hinge). Your job is to generate 3 unique responses to this prompt: "${chosenPrompt}", and then score each response using expert evaluation criteria.

### Step 1: Generate 3 responses
Use the following input:
- User's gender: ${userProfile.gender}
- Target gender: ${userProfile.targetGender}
- Dating app: Hinge
- Desired tones: ${userProfile.tones.join(", ")}
- User interests: ${userProfile.interests.join(", ")}, ${
      userProfile.specificLove
    }

Each response should:
- Be short and snappy, ideally under 20 words
- Use a different tone for each: ${userProfile.tones.join(", ")}
- Feel playful, personal, and confident—not generic or robotic
- Incorporate at least one of these personal details or interests: ${userProfile.interests.join(
      ", "
    )}, or ${userProfile.specificLove}
- Include a natural, casual follow-up question at the end of one response to invite conversation
- It should sound spontaneous, not scripted or awkward
- Avoid sounding like I'm trying too hard—keep it cool and relaxed
- Use humor or irony if it fits the tone, but keep it light and approachable
- Avoid clichés and typical AI phrasing (e.g., no em dashes, no overly formal, no robotic phrasing, no wordy language)
- Use American English and keep it appropriate for a modern dating app
The goal is to make users feel effortlessly interesting, like someone worth messaging back.

### Step 2: Evaluate each response
For every response you write, score it across 5 categories:
1. Personality (30%) – Human, emotionally engaging, not generic
2. Tone Fit (20%) – Matches intent, dating-appropriate
3. Brevity & Clarity (15%) – Concise and easy to read
4. Originality (20%) – Not a cliché, shows voice
5. Conversation Spark (15%) – Invites response

Return for each:
- The response itself
- 5 scores (0–10)
- 1–2 sentence explanation per category
- Calculated weighted average (0–10)
- Label:  
  🔥 Top-Tier (9–10), 🟢 Great Potential (7.5–8.9), 🟡 Room to Grow (6–7.4), 🔴 Needs Work (<6)

Respond in JSON format only, with an array of responses and their evaluations. The root object must have a key named "responses" which contains the array.
For example: { "responses": [ { "response": "...", "scores": {...} }, ... ] }`;

    const suggestions = await callOpenAI(generateResponsesSystem, "", true);
    return { chosenPrompt, ...suggestions };
  }

  /**
   * Feature 1.2: Generate 3 responses for a specific prompt (user-selected)
   */
  async generatePromptSuggestionsForPrompt(userProfile: any, selectedPrompt: string): Promise<any> {
    console.log("generatePromptSuggestionsForPrompt input:", { userProfile, selectedPrompt });
    
    // Skip Step 1 (prompt selection) and go directly to Step 2 with the selected prompt
    const generateResponsesSystem = `You are an AI dating assistant who generates and evaluates creative, personalized answers to dating app prompts (like Hinge). Your job is to generate 3 unique responses to this prompt: "${selectedPrompt}", and then score each response using expert evaluation criteria.

### Step 1: Generate 3 responses
Use the following input:
- User's gender: ${userProfile.gender}
- Target gender: ${userProfile.targetGender}
- Dating app: Hinge
- Desired tones: ${userProfile.tones.join(", ")}
- User interests: ${userProfile.interests.join(", ")}, ${
      userProfile.specificLove
    }

Each response should:
- Be short and snappy, ideally under 20 words
- Use a different tone for each: ${userProfile.tones.join(", ")}
- Feel playful, personal, and confident—not generic or robotic
- Incorporate at least one of these personal details or interests: ${userProfile.interests.join(
      ", "
    )}, or ${userProfile.specificLove}
- Include a natural, casual follow-up question at the end of one response to invite conversation
- It should sound spontaneous, not scripted or awkward
- Avoid sounding like I'm trying too hard—keep it cool and relaxed
- Use humor or irony if it fits the tone, but keep it light and approachable
- Avoid clichés and typical AI phrasing (e.g., no em dashes, no overly formal, no robotic phrasing, no wordy language)
- Use American English and keep it appropriate for a modern dating app
The goal is to make users feel effortlessly interesting, like someone worth messaging back.

### Step 2: Evaluate each response
For every response you write, score it across 5 categories:
1. Personality (30%) – Human, emotionally engaging, not generic
2. Tone Fit (20%) – Matches intent, dating-appropriate
3. Brevity & Clarity (15%) – Concise and easy to read
4. Originality (20%) – Not a cliché, shows voice
5. Conversation Spark (15%) – Invites response

Return for each:
- The response itself
- 5 scores (0–10)
- 1–2 sentence explanation per category
- Calculated weighted average (0–10)
- Label:  
  🔥 Top-Tier (9–10), 🟢 Great Potential (7.5–8.9), 🟡 Room to Grow (6–7.4), 🔴 Needs Work (<6)

Respond in JSON format only, with an array of responses and their evaluations. The root object must have a key named "responses" which contains the array.
For example: { "responses": [ { "response": "...", "scores": {...} }, ... ] }`;

    try {
      const suggestions = await callOpenAI(generateResponsesSystem, "", true);
      console.log("generatePromptSuggestionsForPrompt result:", suggestions);
      return { chosenPrompt: selectedPrompt, ...suggestions };
    } catch (error) {
      console.error("Error in generatePromptSuggestionsForPrompt:", error);
      throw error;
    }
  }

  /**
   * Feature 1.1: Revise an AI-generated prompt
   */
  async revisePromptSuggestion(
    prompt: string,
    response: string,
    evaluation: any,
    feedback: string
  ): Promise<any> {
    console.log("revisePromptSuggestion input:", { prompt, response, evaluation, feedback });
    const systemContent = `You are an AI dating assistant who generates and evaluates creative, personalized answers to dating app prompts (like Hinge). Your job is to generate 3 unique responses to this prompt: "${prompt}", and then score each response using expert evaluation criteria. Now, 3 responses have been generated, and the user is choosing a response to improve based on user input feedback. Your job is to revise the response using the feedback and suggestions provided.

You will receive:
- A Hinge profile prompt
- A user chosen AI-generated response to that prompt
- An evaluation summary across 5 scoring categories of the chosen response
- Suggestions for improvement for the chosen response

### Input:
- Prompt: "${prompt}"
- User chosen AI-Generated Response: "${response}"
- Evaluation Summary of this response:
  - Personality Score: ${evaluation.scores.personality} – ${evaluation.explanation.personality}
  - Tone Fit Score: ${evaluation.scores.tone_fit} – ${evaluation.explanation.tone_fit}
  - Brevity & Clarity Score: ${evaluation.scores.brevity_and_clarity} – ${evaluation.explanation.brevity_and_clarity}
  - Originality Score: ${evaluation.scores.originality} – ${evaluation.explanation.originality}
  - Conversation Spark Score: ${evaluation.scores.conversation_spark} – ${evaluation.explanation.conversation_spark}
- Suggestions for improvement from user: "${feedback}"

### Instructions:
Rewrite the response based on user's feedback. Follow these guidelines:
- Be short and snappy, ideally under 20 words
- Feel playful, personal, and confident—not generic or robotic
- Option to include a natural, casual follow-up question at the end of one response to invite conversation
- It should sound spontaneous, not scripted or awkward
- Avoid sounding like I'm trying too hard—keep it cool and relaxed
- Use humor or irony if it fits the tone, but keep it light and approachable
- Avoid clichés and typical AI phrasing (e.g., no em dashes, no overly formal, no robotic phrasing, no wordy language)
- Use American English and keep it appropriate for a modern dating app
The goal is to make users feel effortlessly interesting, like someone worth messaging back.

Return only the **revised response**. No additional commentary or formatting.`;
    
    try {
    const revisedResponse = await callOpenAI(systemContent, "");
      console.log("revisePromptSuggestion result:", { revisedResponse });
    return { revisedResponse };
    } catch (error) {
      console.error("Error in revisePromptSuggestion:", error);
      throw error;
    }
  }

  /**
   * Feature 2: Evaluate a user's own response
   */
  async evaluateUserPrompt(prompt: string, response: string): Promise<any> {
    const systemContent = `You are an expert at evaluating dating profile's prompt responses for apps like Hinge. This is the user-written answer to their dating prompt: 
- Prompt: "${prompt}" 
- Original Response: "${response}" 
Your job is to:
1. Score the response across 5 key categories
2. Briefly explain each score
3. Calculate a weighted overall score
4. Assign a UX-friendly label based on the final score
5. Provide 1–2 concrete suggestions to help improve the response

### Scoring Criteria (each 0–10):
1. Personality (30%) – Does the response feel human, emotionally engaging, and specific—not generic?
2. Tone Fit (20%) – Is the tone appropriate for dating? (Playful, flirty, casual, confident, or sincere as context allows)
3. Brevity & Clarity (15%) – Is it concise and easy to read (ideally under 20 words)?
4. Originality (20%) – Does it avoid clichés and sound fresh or unique?
5. Conversation Spark (15%) – Does it invite replies—through curiosity, humor, or a natural follow-up?

### Label (based on overall score):
- 9.0–10.0 → 🔥 Top-Tier  
- 7.5–8.9 → 🟢 Great Potential  
- 6.0–7.4 → 🟡 Room to Grow  
- Below 6.0 → 🔴 Needs Work

### Suggestions:
Give 1–2 short, specific tips to help the user improve their answer. Keep them casual, helpful, and practical.

### Return your response in the following JSON format:
{
  "scores": { "personality": 0, "tone_fit": 0, "brevity_clarity": 0, "originality": 0, "conversation_spark": 0 },
  "explanations": { "personality": "...", "tone_fit": "...", "brevity_clarity": "...", "originality": "...", "conversation_spark": "..." },
  "overall_score": 0.0,
  "label": "...",
  "suggestions": [ "...", "..." ]
}`;

    return callOpenAI(systemContent, "", true);
  }

  /**
   * Feature 2.1: Revise a user's evaluated response
   */
  async reviseUserPrompt(
    prompt: string,
    response: string,
    evaluation: any,
    suggestions: string[]
  ): Promise<any> {
    const systemContent = `You are an AI dating assistant that helps users improve their dating app profile responses (like on Hinge) based on expert evaluation feedback.
The user wrote a response to a Hinge prompt and received an evaluation with scores and suggestions. Your job is to rewrite the response to make it more engaging, personal, and conversation-worthy, using the suggestions provided.

### Input:
- Prompt: "${prompt}"
- Original Response: "${response}"
### Evaluation Summary:
- overall Score: ${evaluation.overall_score}
- Personality Score: ${evaluation.scores.personality} – ${
      evaluation.explanations.personality
    }
- Tone Fit Score: ${evaluation.scores.tone_fit} – ${
      evaluation.explanations.tone_fit
    }
- Brevity & Clarity Score: ${evaluation.scores.brevity_clarity} – ${
      evaluation.explanations.brevity_clarity
    }
- Originality Score: ${evaluation.scores.originality} – ${
      evaluation.explanations.originality
    }
- Conversation Spark Score: ${evaluation.scores.conversation_spark} – ${
      evaluation.explanations.conversation_spark
    }
### Suggestions for Improvement:
- ${suggestions.join("\n- ")}

### Instructions:
Rewrite the response. Follow these guidelines: 
- Apply the suggestions directly
- Be short and snappy, ideally under 20 words
- Keep the tone casual, personal, confident, and dating-appropriate
- Include a **follow-up question** only if it feels natural and playful
- It should sound spontaneous, not scripted or awkward
- Avoid sounding like I'm trying too hard—keep it cool and relaxed
- Use humor or irony if it fits the tone, but keep it light and approachable
- Avoid clichés and typical AI phrasing (e.g., no em dashes, no overly formal, no robotic phrasing, no wordy language)
- Use American English and keep it appropriate for a modern dating app
The goal is to make users feel effortlessly interesting, like someone worth messaging back.

Return only the **improved response**—no extra commentary or formatting.`;
    const revisedResponse = await callOpenAI(systemContent, "");
    return { revisedResponse };
  }
}
