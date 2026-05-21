import { prisma } from '@/lib/db';
import { TeachersList } from './TeachersList';

// ============================================
// Types
// ============================================

type TeacherWithCount = {
  id: string;
  name: string;
  subject: string;
  bio: string | null;
  _count: {
    feedback: number;
  };
};

// ============================================
// Server Functions
// ============================================

export const dynamic = 'force-dynamic';

async function getTeachers(): Promise<TeacherWithCount[]> {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        subject: true,
        bio: true,
        _count: {
          select: { feedback: true },
        },
      },
    });
    return teachers;
  } catch {
    return [];
  }
}

// ============================================
// Page Component
// ============================================

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return <TeachersList teachers={teachers} />;
}