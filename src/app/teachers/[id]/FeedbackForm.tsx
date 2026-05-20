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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-text-primary mb-4 text-lg font-semibold">
        Share Your Feedback
      </h2>
      <p className="text-text-secondary mb-4 text-sm">
        Your feedback helps teachers grow. Please be constructive and respectful.
      </p>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
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
          className="text-text-primary w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          rows={5}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !feedbackText.trim()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}