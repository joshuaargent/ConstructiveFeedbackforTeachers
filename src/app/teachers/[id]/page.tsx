import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { GraduationCap, Lightbulb, TrendingUp, MessageCircle, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getTeacherSummary } from '@/app/actions/feedback';
import { FeedbackForm } from '@/components/teachers/FeedbackForm';
import { ShareButton } from '@/components/teachers/ShareButton';
import Link from 'next/link';

// ============================================
// Metadata
// ============================================

export const metadata: Metadata = {
  title: 'Teacher Profile',
  description: 'View teacher profile and share constructive feedback.',
};

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

async function getRelatedTeachers(currentId: string, subjects: string) {
  try {
    const subjectParts = subjects.split('&').map(s => s.trim());

    const teachers = await prisma.teacher.findMany({
      where: {
        NOT: { id: currentId },
        OR: subjectParts.map(sub => ({ subject: { contains: sub } })),
      },
      take: 3,
      select: {
        id: true,
        name: true,
        subject: true,
      },
    });
    return teachers;
  } catch {
    return [];
  }
}

async function getFeedbackStats(id: string) {
  try {
    const total = await prisma.feedback.count({
      where: { teacherId: id },
    });

    const approved = await prisma.feedback.count({
      where: { teacherId: id, isApproved: true },
    });

    return { total, approved };
  } catch {
    return { total: 0, approved: 0 };
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

  const relatedTeachers = await getRelatedTeachers(id, teacher.subject);
  const stats = await getFeedbackStats(id);

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl mb-6">
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Teachers
          </Link>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
                <GraduationCap className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-text-primary">
                  {teacher.name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teacher.subject.split('&').map((sub, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-accent-light px-2.5 py-0.5 text-sm font-medium text-accent"
                    >
                      {sub.trim()}
                    </span>
                  ))}
                </div>
                {teacher.bio && (
                  <p className="mt-3 text-text-secondary">{teacher.bio}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{stats.total}</p>
                  <p className="text-sm text-text-secondary">Total Feedback</p>
                </div>
              </div>
              <ShareButton teacherId={teacher.id} />
            </div>
          </div>

          {summary ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    Overall Themes
                  </h2>
                </div>
                <p className="mt-3 text-text-secondary">{summary.overallThemes}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold text-text-primary">
                      Strengths
                    </h2>
                  </div>
                  <p className="mt-3 text-text-secondary">{summary.strengthHighlights}</p>
                </div>

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
              </div>

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
          ) : (
            <div className="mt-6 rounded-xl border border-border bg-bg-card p-8 text-center shadow-sm">
              <Lightbulb className="mx-auto h-12 w-12 text-text-muted" />
              <p className="mt-4 text-text-secondary">
                No feedback summary yet. Be the first to share constructive feedback!
              </p>
            </div>
          )}

          <div className="mt-8">
            {session?.user ? (
              <FeedbackForm teacherId={teacher.id} />
            ) : (
              <div className="rounded-xl border border-border bg-bg-card p-6 text-center shadow-sm">
                <p className="text-text-secondary">
                  Please{' '}
                  <Link href="/login" className="text-accent hover:underline">
                    sign in
                  </Link>{' '}
                  to share feedback.
                </p>
              </div>
            )}
          </div>

          {relatedTeachers.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                More {teacher.subject.split('&')[0].trim()} Teachers
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTeachers.map(relTeacher => (
                  <Link
                    key={relTeacher.id}
                    href={`/teachers/${relTeacher.id}`}
                    className="rounded-xl border border-border bg-bg-card p-4 shadow-sm transition-all duration-200 hover:border-accent hover:shadow-md"
                  >
                    <h3 className="font-semibold text-text-primary">
                      {relTeacher.name}
                    </h3>
                    <p className="text-sm text-text-secondary">{relTeacher.subject}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}