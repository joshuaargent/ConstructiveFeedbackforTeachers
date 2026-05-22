'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, MessageCircle, Loader2 } from 'lucide-react';

interface Summary {
  overallThemes: string;
  strengthHighlights: string;
  growthOpportunities: string;
  safeParaphrasedComments: string;
}

interface TeacherSummaryProps {
  teacherId: string;
}

export function TeacherSummary({ teacherId }: TeacherSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/feedback/summary?teacherId=${teacherId}`);
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-bg-card p-8 text-center shadow-sm">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 text-text-secondary">Loading summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-bg-card p-8 text-center shadow-sm">
        <Lightbulb className="mx-auto h-12 w-12 text-text-muted" />
        <p className="mt-4 text-text-secondary">
          No feedback summary yet. Be the first to share constructive feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Overall Themes</h2>
        </div>
        <p className="mt-3 text-text-secondary">{summary.overallThemes}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Strengths</h2>
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
          <p className="mt-3 text-text-secondary">{summary.growthOpportunities}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            What Students Are Saying
          </h2>
        </div>
        <p className="mt-3 text-text-secondary">{summary.safeParaphrasedComments}</p>
      </div>
    </div>
  );
}