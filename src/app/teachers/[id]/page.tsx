import { notFound } from 'next/navigation';
import { GraduationCap, Lightbulb, TrendingUp, MessageCircle } from 'lucide-react';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getTeacherSummary } from '@/app/actions/feedback';
import { FeedbackForm } from './FeedbackForm';

// ============================================
// Teacher Detail Page
// ============================================

export const dynamic = 'force-dynamic';

async function getTeacher(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        summary: true,
      },
    });
    return teacher;
  } catch {
    return null;
  }
}

export default async function TeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getTeacher(id);
  const session = await auth();
  const summary = await getTeacherSummary(id);

  if (!teacher) {
    notFound();
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          {/* Teacher Header */}
          <div className="mb-8 rounded-xl border border-border bg-bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
                <GraduationCap className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {teacher.name}
                </h1>
                <p className="text-lg text-text-secondary mt-1">{teacher.subject}</p>
                {teacher.bio && (
                  <p className="mt-3 text-text-secondary">{teacher.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Sections */}
          {summary && (
            <div className="space-y-6">
              {/* Overall Themes */}
              <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    Overall Themes
                  </h2>
                </div>
                <p className="mt-3 text-text-secondary">{summary.overallThemes}</p>
              </div>

              {/* Strength Highlights */}
              <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    Strengths
                  </h2>
                </div>
                <p className="mt-3 text-text-secondary">{summary.strengthHighlights}</p>
              </div>

              {/* Growth Opportunities */}
              <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    Growth Opportunities
                  </h2>
                </div>
                <p className="mt-3 text-text-secondary">
                  {summary.growthOpportunities}
                </p>
              </div>

              {/* Safe Paraphrased Comments */}
              <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    What Students Are Saying
                  </h2>
                </div>
                <p className="mt-3 text-text-secondary">
                  {summary.safeParaphrasedComments}
                </p>
              </div>
            </div>
          )}

          {!summary && (
            <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
              <p className="text-center text-text-secondary">
                No feedback summary available yet. Be the first to share constructive
                feedback!
              </p>
            </div>
          )}

          {/* Feedback Form */}
          <div className="mt-8">
            {session?.user ? (
              <FeedbackForm teacherId={teacher.id} />
            ) : (
              <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                <p className="text-center text-text-secondary">
                  Please{' '}
                  <a href="/login" className="text-accent hover:underline">
                    sign in
                  </a>{' '}
                  to share feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}