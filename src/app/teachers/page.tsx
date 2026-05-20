import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { prisma } from '@/lib/db';

// ============================================
// Teachers List Page
// ============================================

export const dynamic = 'force-dynamic';

async function getTeachers() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        subject: true,
        bio: true,
      },
    });
    return teachers;
  } catch {
    return [];
  }
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-text-primary text-3xl font-bold tracking-tight md:text-4xl">
            Our Teachers
          </h1>
          <p className="text-text-secondary mt-4 text-lg">
            Browse teacher profiles and share constructive feedback to help them grow.
          </p>
        </div>

        {teachers.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-text-secondary">
              No teachers found. Please run the seed script to add teachers.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Link
                key={teacher.id}
                href={`/teachers/${teacher.id}`}
                className="group block rounded-xl border border-border bg-bg-card p-6 shadow-sm transition-all duration-200 hover:border-accent hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent">
                      {teacher.name}
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">{teacher.subject}</p>
                    {teacher.bio && (
                      <p className="mt-2 text-sm line-clamp-2 text-text-secondary">
                        {teacher.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}