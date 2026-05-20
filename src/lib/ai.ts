// AI client for OpenRouter API
// Used for feedback moderation and teacher summary generation

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use OpenRouter's automatic free model selection
const DEFAULT_MODEL = 'openrouter/free';

// ============================================
// Type definitions
// ============================================

export interface ModerationResult {
  category: 'constructive' | 'neutral' | 'insulting' | 'other';
  usefulnessScore: number;
  tags: string[];
}

export interface SummaryResult {
  overallThemes: string;
  strengthHighlights: string;
  growthOpportunities: string;
  safeParaphrasedComments: string;
}

// ============================================
// Moderation prompt (embedded in code)
// ============================================

const MODERATION_SYSTEM_PROMPT = `You are a classifier for student feedback about teachers.  
Your job is to:
1. Decide whether the feedback is constructive, neutral, insulting, or other.  
2. Assign a usefulness score between 0 and 1, where:
   - 0 = not useful at all for teacher improvement  
   - 1 = extremely useful and actionable  
3. Extract 2–5 high-level tags that describe the main themes of the feedback (e.g. "communication", "organisation", "clarity", "pace", "supportiveness").

The feedback may contain slang, emotion, or informal language.  
You must treat anything that includes insults, name-calling, harassment, or personal attacks as **insulting**, even if there is some useful content.

Return your answer as **strict JSON** with the following shape:

{
  "category": "constructive" | "neutral" | "insulting" | "other",
  "usefulnessScore": number,  // between 0 and 1
  "tags": string[]
}

Do not include any extra fields. Do not include explanations. Only return JSON.`;

// ============================================
// Summary generation prompt (embedded in code)
// ============================================

const SUMMARY_SYSTEM_PROMPT = `You are generating a supportive, professional summary of student feedback for a teacher.  
The goal is to help the teacher grow while protecting their wellbeing.  
You will be given multiple feedback entries that have already been filtered to remove insults and harmful content.

Your tasks:
1. Identify the main themes in the feedback.  
2. Highlight the teacher's strengths.  
3. Gently describe growth opportunities in a constructive, non-judgemental way.  
4. Provide a few short, paraphrased example comments that are safe and supportive.

Very important rules:
- Use a calm, neutral, and encouraging tone.  
- Do not include any insults, harsh language, or personal attacks.  
- Do not speculate about the teacher's personality or character.  
- Focus on behaviours and teaching practices, not the teacher as a person.  
- Do not include any direct quotes from students; always paraphrase.  
- Do not mention scores, ratings, or anything that feels like grading the teacher.

Return your answer as JSON with this shape:

{
  "overallThemes": string,           // 1–2 paragraphs
  "strengthHighlights": string,      // bullet-style text or short paragraphs
  "growthOpportunities": string,     // gentle, actionable suggestions
  "safeParaphrasedComments": string  // a few short paraphrased comments
}

Do not include any extra fields. Do not include explanations. Only return JSON.`;

// ============================================
// API helper functions
// ============================================

async function callOpenRouter(
  userMessage: string,
  systemPrompt: string,
): Promise<unknown> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Constructive Feedback for Teachers',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Invalid response from OpenRouter');
  }

  return JSON.parse(content);
}

// ============================================
// Public API functions
// ============================================

/**
 * Moderates feedback text using AI
 * Returns category, usefulness score, and tags
 */
export async function moderateFeedback(feedbackText: string): Promise<ModerationResult> {
  const result = await callOpenRouter(
    `Feedback to classify:\n\n${feedbackText}`,
    MODERATION_SYSTEM_PROMPT,
  );

  // Type guard to validate the result
  if (
    typeof result !== 'object' ||
    result === null ||
    !('category' in result) ||
    !('usefulnessScore' in result) ||
    !('tags' in result)
  ) {
    throw new Error('Invalid moderation result from AI');
  }

  const validCategories = ['constructive', 'neutral', 'insulting', 'other'];
  const rawCategory = String(result.category);
  const category = validCategories.includes(rawCategory)
    ? rawCategory as 'constructive' | 'neutral' | 'insulting' | 'other'
    : 'other';

  const usefulnessScore = Math.max(
    0,
    Math.min(1, typeof result.usefulnessScore === 'number' ? result.usefulnessScore : 0),
  );

  const tags = Array.isArray(result.tags) ? result.tags : [];

  return {
    category,
    usefulnessScore,
    tags,
  };
}

/**
 * Generates a summary of approved feedback for a teacher
 * Takes an array of feedback entries with rawText, tags, and usefulnessScore
 */
export async function generateTeacherSummary(
  feedbackEntries: Array<{
    rawText: string;
    tags: string[];
    usefulnessScore: number;
  }>,
): Promise<SummaryResult> {
  // Format feedback for the AI
  const feedbackFormatted = feedbackEntries
    .map(
      (entry, index) =>
        `Feedback ${index + 1}:
Text: ${entry.rawText}
Tags: ${entry.tags.join(', ')}
Usefulness: ${entry.usefulnessScore}`,
    )
    .join('\n\n');

  const result = await callOpenRouter(
    `Here are ${feedbackEntries.length} feedback entries to summarize:\n\n${feedbackFormatted}`,
    SUMMARY_SYSTEM_PROMPT,
  );

  // Type guard to validate the result
  if (
    typeof result !== 'object' ||
    result === null ||
    !('overallThemes' in result) ||
    !('strengthHighlights' in result) ||
    !('growthOpportunities' in result) ||
    !('safeParaphrasedComments' in result)
  ) {
    throw new Error('Invalid summary result from AI');
  }

  return {
    overallThemes: String(result.overallThemes || ''),
    strengthHighlights: String(result.strengthHighlights || ''),
    growthOpportunities: String(result.growthOpportunities || ''),
    safeParaphrasedComments: String(result.safeParaphrasedComments || ''),
  };
}