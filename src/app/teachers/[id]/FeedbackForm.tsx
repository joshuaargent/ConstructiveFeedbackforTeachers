'use client';

import { useState } from 'react';
import { submitFeedback } from '@/app/actions/feedback';

interface FeedbackFormProps {
  teacherId: string;
}

// ============================================
// Feedback Form Component
// ============================================

export function FeedbackForm({ teacherId }: FeedbackFormProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setMessage({ type: 'error', text: 'Please enter your feedback' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await submitFeedback(teacherId, feedbackText);

      if ('error' in result && result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({
          type: 'success',
          text: result.isApproved
            ? 'Thank you! Your constructive feedback has been submitted.'
            : 'Thank you for your feedback, but it was not suitable for publication.',
        });
        setFeedbackText('');
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Share Your Feedback
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Your feedback helps teachers grow. Please be constructive and respectful.
      </p>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Share constructive feedback about this teacher..."
          className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          rows={5}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !feedbackText.trim()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}