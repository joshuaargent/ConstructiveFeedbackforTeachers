// AI client for OpenRouter API
// Used for feedback moderation and teacher summary generation

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use a specific reliable model for consistent results
// Google Gemini Flash is fast, free tier friendly, and high quality
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

// Fallback model if default isn't available
const FALLBACK_MODEL = 'deepseek/deepseek-chat';

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
// Moderation prompt (optimized for quality)
// ============================================

const MODERATION_SYSTEM_PROMPT = `You are an expert feedback classifier for student feedback about teachers.

Your task is to analyze each piece of feedback and:
1. Classify it as: constructive (helpful for growth), neutral (OK but not actionable), insulting (harmful/name-calling), or other (unclear/off-topic)
2. Rate usefulness 0-1 (how actionable is this for teacher improvement?)
3. Extract 2-5 topic tags (e.g., "communication", "organization", "clarity", "pace", "supportiveness", "homework", "exams")

Classification Rules:
- "constructive": Specific, actionable, kind feedback like "Explains concepts clearly" or "Would appreciate more examples"
- "neutral": General statements without clear action items like "He's fine" or "The class was okay"
- "insulting": ANY personal attacks, name-calling, harassment, or hostile language - even mixed with useful content
- "other": Spam, gibberish, or unclear content

Rate usefulness as:
- 1.0 = Highly specific and actionable ("Great at breaking down complex math problems")
- 0.7 = Actionable but could be more specific  
- 0.5 = Moderate usefulness
- 0.3 = Slightly useful
- 0.0 = Not useful at all

Respond with STRICT JSON only:
{"category": "constructive"|"neutral"|"insulting"|"other", "usefulnessScore": number, "tags": string[]}`;

// ============================================
// Summary generation prompt (optimized for quality)
// ============================================

const SUMMARY_SYSTEM_PROMPT = `You are generating a thoughtful, growth-oriented summary of student feedback for a teacher. Your audience is a professional who wants to improve.

Guidelines:
1. **Identify 2-4 main themes** - What's students mentioning most? Group similar feedback.
2. **Highlight genuine strengths** - What do students consistently praise? Be specific.
3. **Suggest growth areas** - Frame as opportunities, not criticisms. "Consider adding..." vs "They never..."
4. **Safe paraphrases** - Never include actual student words. Paraphrase supportively.

Tone: Professional, warm, encouraging - like a supportive colleague giving feedback.

What to AVOID:
- Don't quote students directly
- Don't mention grades or scores
- Don't generalize personality ("The teacher is lazy")
- Don't include anything that could identify students

Output format (JSON):
{
  "overallThemes": "2-3 sentences on main patterns",
  "strengthHighlights": "2-3 specific things students appreciate",
  "growthOpportunities": "2-3 gentle improvement suggestions", 
  "safeParaphrasedExamples": "2-3 anonymized example comments"
}`;

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

  const models = [DEFAULT_MODEL, FALLBACK_MODEL, 'openrouter/auto'];
  const currentModel = models[retryCount % models.length];

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
        temperature: 0.3, // Lower temperature for more consistent output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Retry on rate limit or model errors
      if ((response.status === 429 || response.status >= 500) && retryCount < 2) {
        console.log(`[AI] Retrying with model ${models[(retryCount + 1) % models.length]}...`);
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
    // Retry on parse errors or network issues
    if (retryCount < 2) {
      console.log(`[AI] Retrying after error: ${error}`);
      return callOpenRouter(userMessage, systemPrompt, retryCount + 1);
    }
    throw error;
  }
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