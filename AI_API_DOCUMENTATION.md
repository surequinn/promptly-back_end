# Promptly AI API Documentation

This document provides instructions for the frontend team on how to integrate with the new AI-powered endpoints for prompt generation and evaluation. All endpoints require the standard `Authorization: Bearer <token>` header for authenticated users.

---

## Feature 1: AI-Assisted Prompt Writing

### 1.1 Generate Prompt Suggestions

This is the primary endpoint for the "Write a prompt for me" feature. It takes the user's profile information and returns three unique, scored, and evaluated prompt suggestions.

- **URL**: `/api/prompts/generate-suggestions`
- **Method**: `POST`
- **Description**: Kicks off the full AI generation flow. The backend will first use the user's profile to select an optimal Hinge prompt and then generate three distinct responses for it.
- **Request Body**:

```json
{
  "userProfile": {
    "gender": "man",
    "targetGender": "woman",
    "tones": ["witty", "flirty", "playful"],
    "interests": ["tennis", "exotic cooking", "travel"],
    "specificLove": "I love Wes Anderson films, I'm obsessed with fermentation, I always cry during Pixar movies"
  }
}
```

- **Success Response (200 OK)**:

```json
{
  "responses": [
    {
      "text": "I won't shut up about perfecting kimchi. Yes, it's a personality trait. Wanna try my spicy batch?",
      "scores": {
        "personality": 9,
        "tone_fit": 9,
        "brevity_clarity": 9,
        "originality": 9,
        "conversation_spark": 9
      },
      "explanations": {
        "personality": "Strong personal voice, quirky detail, and food passion create an authentic and memorable impression.",
        "tone_fit": "Confident, flirty, and casually funny—perfect for Hinge.",
        "brevity_clarity": "Well within the word limit and easy to digest.",
        "originality": "Kimchi fermentation is uncommon and gives this personality.",
        "conversation_spark": "The question at the end naturally invites a reply."
      },
      "overall_score": 9.0,
      "label": "🔥 Top-Tier"
    }
    // ... 2 more response objects
  ]
}
```

---

### 1.2 Revise an AI-Generated Suggestion

After the user chooses one of the three AI suggestions, they can provide feedback to revise it.

- **URL**: `/api/prompts/revise-suggestion`
- **Method**: `POST`
- **Description**: Takes a chosen AI response and user feedback, and returns a single, improved version.
- **Request Body**:

```json
{
  "prompt": "I won't shut up about",
  "response": "I won't shut up about perfecting kimchi. Yes, it's a personality trait. Wanna try my spicy batch?",
  "evaluation": {
    "overall_score": 9.0,
    "label": "🔥 Top-Tier"
    // ... full evaluation object for context
  },
  "feedback": "Make it a bit more relaxed and mention fermentation in general, not just kimchi."
}
```

- **Success Response (200 OK)**:

```json
{
  "revisedResponse": "I won't shut up about fermenting everything from carrots to miso. Ever made your own pickles?"
}
```

---

## Feature 2: Evaluate User's Own Prompt

### 2.1 Evaluate a Custom-Written Prompt

This endpoint is for the "Rate my prompt" feature, where a user submits their own writing for evaluation.

- **URL**: `/api/prompts/evaluate-custom`
- **Method**: `POST`
- **Description**: Takes a user-written prompt and response, and returns a full evaluation with scores, explanations, and suggestions.
- **Request Body**:

```json
{
  "prompt": "Typical Sunday",
  "response": "6am coffee run, then taking my dog to the beach. The earlier the better."
}
```

- **Success Response (200 OK)**:

```json
{
  "scores": {
    "personality": 8,
    "tone_fit": 8,
    "brevity_clarity": 7,
    "originality": 6,
    "conversation_spark": 6
  },
  "explanations": {
    "personality": "The response feels warm and genuine...",
    "tone_fit": "Tone is casual and dating-appropriate...",
    "brevity_clarity": "It's slightly wordy but still easy to read...",
    "originality": "Coffee runs and beach walks are pleasant but fairly common...",
    "conversation_spark": "It paints a nice picture but doesn't explicitly invite engagement..."
  },
  "overall_score": 7.2,
  "label": "🟡 Room to Grow",
  "suggestions": [
    "Add a specific detail—like your favorite beach or your pup's name—to help it stand out.",
    "Try ending with a light question like 'Too much morning energy for you?' to spark a reply."
  ]
}
```

---

### 2.2 Revise a User's Custom Prompt

After the user receives their evaluation, they can have the AI revise their original response based on the suggestions.

- **URL**: `/api/prompts/revise-custom`
- **Method**: `POST`
- **Description**: Takes the user's original writing and the AI's evaluation, and returns a single, improved version.
- **Request Body**:

```json
{
  "prompt": "Typical Sunday",
  "response": "6am coffee run, then taking my dog to the beach. The earlier the better.",
  "evaluation": {
    "overall_score": 7.2,
    "label": "🟡 Room to Grow"
    // ... full evaluation object
  },
  "suggestions": [
    "Add a specific detail—like your favorite beach or your pup's name—to help it stand out.",
    "Try ending with a light question like 'Too much morning energy for you?' to spark a reply."
  ]
}
```

- **Success Response (200 OK)**:

```json
{
  "revisedResponse": "I'm looking for someone who's down for sunrise matcha walks on Venice Beach with Max—too much morning energy for you?"
}
```
