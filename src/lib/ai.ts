// AI client for OpenRouter API
// Used for feedback moderation and teacher summary generation

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use reliable free models with fallbacks - best chance of getting a working model
const FREE_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',  // Large but capable
  'nvidia/nemotron-nano-9b-v2-velarde:free', // Fast fallback
  'openrouter/free',                       // Ultimate fallback
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

RESPOND JSON:
{"category": "constructive"|"neutral"|"insulting"|"other", "usefulnessScore": 0.0-1.0, "tags": []}`;

// ============================================
// Summary generation prompt - aggregate constructive feedback
// ============================================

const SUMMARY_SYSTEM_PROMPT = `Summarize ONLY CONSTRUCTIVE feedback.
Skip neutral/vague.
Output JSON: overallThemes, strengthHighlights, growthOpportunities, safeParaphrasedComments`;

// ============================================
// API helper functions with retry logic
// ============================================

async function callOpenRouter(
  userMessage: string,
  systemPrompt: string,
  retryCount = 0,
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
        console.log(`[AI] Retrying with ${currentModel} after ${response.status} error (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
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
      console.log(`[AI] Retrying after error with next model: ${error} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
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
  const result = await callOpenRouter(
    "Classify: " + feedbackText,
    MODERATION_SYSTEM_PROMPT,
  );

  // Gracefully handle incomplete AI responses
  const res = result as Record<string, unknown> | undefined;
  const category = String(res?.category || 'other');
  const validCategories = ['constructive', 'neutral', 'insulting', 'other'];
  const finalCategory = validCategories.includes(category)
    ? category as ModerationResult['category']
    : 'other';

  return {
    category: finalCategory,
    usefulnessScore: Math.max(0, Math.min(1, Number(res?.usefulnessScore) || 0)),
    tags: Array.isArray(res?.tags) ? (res.tags as string[]) : [],
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
    "Summarize: " + feedbackEntries.length + " entries",
    SUMMARY_SYSTEM_PROMPT,
  );

  // Gracefully handle incomplete AI responses
  const res = result as Record<string, unknown> | undefined;

  return {
    overallThemes: String(res?.overallThemes || ''),
    strengthHighlights: String(res?.strengthHighlights || ''),
    growthOpportunities: String(res?.growthOpportunities || ''),
    safeParaphrasedComments: String(res?.safeParaphrasedComments || ''),
  };
}