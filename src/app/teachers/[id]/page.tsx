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
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-teal-50">
                <GraduationCap className="h-7 w-7 text-teal-600" />
              </div>
              <div>
                <h1 className="text-text-primary text-2xl font-bold">
                  {teacher.name}
                </h1>
                <p className="text-text-secondary mt-1 text-lg">{teacher.subject}</p>
                {teacher.bio && (
                  <p className="text-text-secondary mt-3">{teacher.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Sections */}
          {summary && (
            <div className="space-y-6">
              {/* Overall Themes */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-teal-600" />
                  <h2 className="text-text-primary text-lg font-semibold">
                    Overall Themes
                  </h2>
                </div>
                <p className="text-text-secondary mt-3">{summary.overallThemes}</p>
              </div>

              {/* Strength Highlights */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  <h2 className="text-text-primary text-lg font-semibold">
                    Strengths
                  </h2>
                </div>
                <p className="text-text-secondary mt-3">{summary.strengthHighlights}</p>
              </div>

              {/* Growth Opportunities */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  <h2 className="text-text-primary text-lg font-semibold">
                    Growth Opportunities
                  </h2>
                </div>
                <p className="text-text-secondary mt-3">
                  {summary.growthOpportunities}
                </p>
              </div>

              {/* Safe Paraphrased Comments */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-teal-600" />
                  <h2 className="text-text-primary text-lg font-semibold">
                    What Students Are Saying
                  </h2>
                </div>
                <p className="text-text-secondary mt-3">
                  {summary.safeParaphrasedComments}
                </p>
              </div>
            </div>
          )}

          {!summary && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-text-secondary text-center">
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
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-text-secondary text-center">
                  Please{' '}
                  <a href="/login" className="text-teal-600 hover:underline">
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