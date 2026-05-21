// AI client for OpenRouter API
// Used for feedback moderation and teacher summary generation

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use specific free models sorted by capability (best first)
// These models support JSON output and are ranked by performance
const FREE_MODELS = [
  'google/gemma-4-31b-it:free',              // Gemma 4 31B - Best overall
  'google/gemma-4-26b-a4b-it:free',          // Gemma 4 26B A4B - Strong alternative
  'nvidia/nemotron-3-super-120b-a12b:free', // Nemotron 3 Super - Large but capable
  'nvidia/nemotron-nano-9b-v2-velarde:free', // Nemotron Nano 9B V2 - Fast fallback
  'openrouter/free',                         // Last resort fallback
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
// Moderation prompt - balanced conservative for safety
// ============================================

const MODERATION_SYSTEM_PROMPT = `You are a conservative feedback classifier for teacher evaluations.

SAFETY FIRST: Err on the side of caution. Borderline content = insulting.

APPROVAL RULE:
- "constructive": ONLY if ALL true:
  * Genuinely positive framing (praise what's working)
  * Specific and actionable
  * No negativity, criticism, or complaints
  * No "but", "however", or suggested improvements
  
- "neutral": ONLY vague positivity like "they're fine" or "good teacher"
- "insulting": EVERYTHING else including:
  * Any criticism even framed as "suggestion"
  * Any negativity about ability/skip
  * Any comparisons to other teachers
  * Any "could", "would be nice", "should"
  * Tone issues, "whatever", frustration
  
- "other": Spam, unclear

STRICT EXAMPLES showing what PASSES:
✅ "explains concepts clearly" = constructive
✅ "very knowledgeable" = constructive
✅ "patient and helpful" = constructive
✅ "makes lessons engaging" = constructive

WHAT FAILS (insulting):
❌ "could use more examples" = insulting (suggestion)
❌ "sometimes confusing" = insulting (criticism)
❌ "better than last year" = insulting (comparison)
❌ "explains okay I guess" = insulting (borderline)

Respond ONLY with valid JSON:
{"category": "constructive"|"neutral"|"insulting"|"other", "usefulnessScore": 0.0-1.0, "tags": ["tag1", "tag2"]}`;

// ============================================
// Summary generation prompt - optimized for readability
// ============================================

const SUMMARY_SYSTEM_PROMPT = `You are a supportive teaching coach creating a brief summary of student feedback.

Keep each section SHORT and SCANNABLE:
- Overall Themes: 2 sentences max on what students mention most
- Strengths: 2-3 specific things students appreciate (bullet style OK)
- Growth: 2-3 gentle suggestions framed positively
- Quotes: 2-3 short paraphrased comments (not real student words)

Rules:
- Be concise, use short paragraphs
- Frame growth as "opportunities" not criticism  
- Use simple, clear language
- Never include identifying info

Response format (JSON):
{"overallThemes": "short paragraph", "strengthHighlights": "bullets or short paragraphs", "growthOpportunities": "short suggestions", "safeParaphrasedComments": "short quotes"}`;

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
  // First pass - main classification
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

  // Second pass - safety verification for borderline cases
  // If classified as constructive/neutral, verify it's actually safe to display
  const category = String(result.category);
  if (category === 'constructive' || category === 'neutral') {
    const safetyCheck = await callOpenRouter(
      `Is this feedback SAFE to display publicly to teachers?

Feedback: "${feedbackText}"

Answer YES only if ALL of these are true:
- No hints of sarcasm, eye-rolling, or dismissiveness
- Actually helpful for teacher improvement
- Would be comfortable if teacher read it in front of school principal
- No "I'm just being honest" or "no offense but" phrasing
- No comparisons that put teacher down (better than, unlike, etc.)

Respond ONLY with JSON: {"safe": true|false}`,
    );
    
    // If safety check fails, downgrade to 'other' - requires manual review
    if (typeof safetyCheck === 'object' && safetyCheck !== null && 'safe' in safetyCheck && safetyCheck.safe === false) {
      console.log('[MODERATION] Safety check failed, requiring manual review');
      return {
        category: 'other',
        usefulnessScore: 0,
        tags: [],
      };
    }
  }

  // Determine final category (default to 'other' if invalid)
  const validCategories = ['constructive', 'neutral', 'insulting', 'other'];
  const rawCategory = String(result.category);
  const finalCategory = validCategories.includes(rawCategory)
    ? rawCategory as 'constructive' | 'neutral' | 'insulting' | 'other'
    : 'other';

  const usefulnessScore = Math.max(
    0,
    Math.min(1, typeof result.usefulnessScore === 'number' ? result.usefulnessScore : 0),
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