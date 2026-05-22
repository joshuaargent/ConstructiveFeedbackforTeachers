import { NextRequest, NextResponse } from 'next/server';
import { getTeacherSummary } from '@/app/actions/feedback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');

  if (!teacherId) {
    return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
  }

  try {
    const summary = await getTeacherSummary(teacherId);

    if (!summary) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}