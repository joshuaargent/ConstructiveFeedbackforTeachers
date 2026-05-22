'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { moderateFeedback, generateTeacherSummary } from '@/lib/ai';
import { revalidatePath } from 'next/cache';

// ============================================
// Development Logging Helper
// ============================================

const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// Server Actions for Feedback
// ============================================

/**
 * Submit feedback for a teacher
 * Handles AI moderation and saves the feedback
 */
export async function submitFeedback(teacherId: string, feedbackText: string) {
  // Check authentication
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  if (!teacherId || !feedbackText) {
    return { error: 'Teacher ID and feedback text are required' };
  }

  // Check if teacher exists
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    return { error: 'Teacher not found' };
  }

  // AI moderation
  let moderationResult;
  if (isDevelopment) {
    console.log('[FEEDBACK] Starting AI moderation for:', feedbackText.substring(0, 50));
  }
  try {
    moderationResult = await moderateFeedback(feedbackText);
    if (isDevelopment) {
      console.log('[FEEDBACK] AI result:', JSON.stringify(moderationResult));
    }
  } catch (aiError) {
    console.error('[FEEDBACK] AI moderation error:', aiError);
    // CRITICAL: When AI fails, default to 'other' which requires manual review
    // This ensures insults don't slip through when the AI is unavailable
    moderationResult = {
      category: 'other',
      usefulnessScore: 0,
      tags: [],
    };
  }

  // Create feedback entry
  // Only truly constructive feedback auto-approves
  // Neutral + insulting + other = review required
  const feedback = await prisma.feedback.create({
    data: {
      teacherId,
      userId: session.user.id,
      rawText: feedbackText,
      isApproved: moderationResult.category === 'constructive',
      category: moderationResult.category,
      usefulnessScore: moderationResult.usefulnessScore,
      tags: moderationResult.tags,
    },
  });

  // Revalidate the teacher page to update the summary cache
  revalidatePath(`/teachers/${teacherId}`);

  return {
    id: feedback.id,
    isApproved: feedback.isApproved,
    category: feedback.category,
  };
}

/**
 * Get or generate summary for a teacher
 * Uses caching with 3-hour TTL
 */
export async function getTeacherSummary(teacherId: string) {
  const SUMMARY_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  // Check for existing summary
  const existingSummary = await prisma.teacherSummary.findUnique({
    where: { teacherId },
  });

  // If summary exists and is less than 3 hours old, return it
  if (existingSummary) {
    const now = new Date();
    const updatedAt = existingSummary.updatedAt;
    const age = now.getTime() - updatedAt.getTime();

    if (age < SUMMARY_CACHE_TTL) {
      return existingSummary;
    }
  }

  // Get all approved feedback for this teacher
  const approvedFeedback = await prisma.feedback.findMany({
    where: {
      teacherId,
      isApproved: true,
    },
    select: {
      rawText: true,
      tags: true,
      usefulnessScore: true,
    },
  });

  // If no approved feedback, return null (don't show stale data)
  if (approvedFeedback.length === 0) {
    return null;
  }

  // Generate AI summary even with just 1 feedback
  const MIN_FEEDBACK_FOR_SUMMARY = 1;
  if (approvedFeedback.length < MIN_FEEDBACK_FOR_SUMMARY) {
    // Shouldn't reach here with MIN_FEEDBACK_FOR_SUMMARY = 1
    return null;
  }

  // Generate new summary using AI
  let newSummary;
  try {
    newSummary = await generateTeacherSummary(approvedFeedback);
  } catch (aiError) {
    console.error('AI summary generation error:', aiError);
    // If AI fails, return existing summary or default
    return existingSummary || null;
  }

  // Validate AI response has all required fields
  if (!newSummary?.overallThemes || !newSummary?.strengthHighlights) {
    console.error('Invalid AI summary response');
    return existingSummary || null;
  }

  // Upsert the summary
  const summary = await prisma.teacherSummary.upsert({
    where: { teacherId },
    update: {
      ...newSummary,
      updatedAt: new Date(),
    },
    create: {
      teacherId,
      ...newSummary,
    },
  });

  return summary;
}