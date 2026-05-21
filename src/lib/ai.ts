// AI client for OpenRouter API
// Used for feedback moderation and teacher summary generation

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use reliable free models with fallbacks - best chance of getting a working model
const FREE_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free', // Large but capable
  'nvidia/nemotron-nano-9b-v2-velarde:free', // Fast fallback
  'openrouter/free', // Ultimate fallback
];

// Maximum retries for transient failures
const MAX_RETRIES = 3;

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
// Moderation prompt - classify feedback for safety
// ============================================

const MODERATION_SYSTEM_PROMPT = `You classify student feedback.

PRIMARY GOAL: Get useful feedback to teachers WITHOUT getting site banned.
CRITICAL RULE: If feedback contains BOTH constructive AND insulting content, mark as INSULTING.

CLASSIFICATION:
- "constructive": Feedback with ONLY positive/helpful content
- "insulting": Hatespeech, personal attacks, even if mixed with praise
- "neutral": Too vague ("ok", "boring", "fine")
- "other": Spam/garbage

EXAMPLES:
* "good but he's lazy" = insulting

RESPOND ONLY with valid JSON:
{"category": "constructive"|"neutral"|"insulting"|"other", "usefulnessScore": 0.0-1.0, "tags": []}`;

// ============================================
// Summary generation prompt - aggregate constructive feedback
// ============================================

const SUMMARY_SYSTEM_PROMPT = `You summarise student feedback.

PRIMARY GOAL: Get useful feedback to teachers WITHOUT getting site banned.
CRITICAL RULE: Never include identifying info. Never make anything up, ask for more feedback if needed.

CLASSIFICATION:
- Overall Themes: 2 sentences max on what students mention most
- Strengths: 2 specific things students appreciate 
- Growth: 2  suggestions framed as opportunities
- Quotes: 2 short paraphrased comments (never real student words)

RESPOND ONLY with valid (JSON):
{"overallThemes": "short paragraph", "strengthHighlights": "bullets or short paragraphs", "growthOpportunities": "short suggestions", "safeParaphrasedComments": "short quotes"}`;

// ============================================
// API helper functions with retry logic
// ============================================

async function callOpenRouter(
  userMessage: string,
  systemPrompt: string,
  retryCount = 0
): Promise<unknown> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  // Rotate through models on each retry attempt
  const currentModel = FREE_MODELS[retryCount % FREE_MODELS.length];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Constructive Feedback for Teachers',
      },
      body: JSON.stringify({
        model: currentModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Retry on rate limit (429) or server errors (500+) - try next model
      if ((response.status === 429 || response.status >= 500) && retryCount < MAX_RETRIES) {
        console.log(
          `[AI] Retrying with ${currentModel} after ${response.status} error (attempt ${retryCount + 1}/${MAX_RETRIES})...`
        );
        return callOpenRouter(userMessage, systemPrompt, retryCount + 1);
      }
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Invalid response from OpenRouter');
    }

    return JSON.parse(content);
  } catch (error) {
    // Retry on parse errors or network issues - try next model
    if (retryCount < MAX_RETRIES) {
      console.log(
        `[AI] Retrying after error with next model: ${error} (attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      return callOpenRouter(userMessage, systemPrompt, retryCount + 1);
    }
    throw error;
  }
}

// ============================================
// Public API functions
// ============================================

/**
 * Moderates feedback text using AI - double check for safety
 * Returns category, usefulness score, and tags
 */
export async function moderateFeedback(feedbackText: string): Promise<ModerationResult> {
  // First pass - main classification
  const result = await callOpenRouter(
    `Feedback to classify:\n\n${feedbackText}`,
    MODERATION_SYSTEM_PROMPT
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

  // Determine final category (default to 'other' if invalid)
  const validCategories = ['constructive', 'neutral', 'insulting', 'other'];
  const rawCategory = String(result.category);
  const finalCategory = validCategories.includes(rawCategory)
    ? (rawCategory as 'constructive' | 'neutral' | 'insulting' | 'other')
    : 'other';

  const usefulnessScore = Math.max(
    0,
    Math.min(1, typeof result.usefulnessScore === 'number' ? result.usefulnessScore : 0)
  );

  const tags = Array.isArray(result.tags) ? result.tags : [];

  return {
    category: finalCategory,
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
  }>
): Promise<SummaryResult> {
  // Format feedback for the AI
  const feedbackFormatted = feedbackEntries
    .map(
      (entry, index) =>
        `Feedback ${index + 1}:
Text: ${entry.rawText}
Tags: ${entry.tags.join(', ')}
Usefulness: ${entry.usefulnessScore}`
    )
    .join('\n\n');

  const result = await callOpenRouter(
    `Here are ${feedbackEntries.length} feedback entries to summarize:\n\n${feedbackFormatted}`,
    SUMMARY_SYSTEM_PROMPT
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
