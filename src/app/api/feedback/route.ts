import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { moderateFeedback } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { teacherId, feedbackText } = body;

    if (!teacherId || !feedbackText) {
      return NextResponse.json(
        { error: 'Teacher ID and feedback text are required' },
        { status: 400 },
      );
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 },
      );
    }

    // AI moderation
    let moderationResult;
    try {
      moderationResult = await moderateFeedback(feedbackText);
    } catch (aiError) {
      console.error('AI moderation error:', aiError);
      // CRITICAL: When AI fails, default to 'other' which requires manual review
      // This ensures insults don't slip through when the AI is unavailable
      moderationResult = {
        category: 'other',
        usefulnessScore: 0,
        tags: [],
      };
    }

    // Create feedback entry
    // Only constructive feedback auto-approves
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

    return NextResponse.json({
      id: feedback.id,
      isApproved: feedback.isApproved,
      category: feedback.category,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}