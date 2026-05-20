import Link from 'next/link';
import { Heart, Users, GraduationCap } from 'lucide-react';

// ============================================
// Homepage - Landing page for the app
// ============================================

export function Hero() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-text-primary text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Constructive Feedback for{' '}
            <span style={{ color: '#0D9488' }}>Teachers</span>
          </h1>
          <p className="text-text-secondary mx-auto mt-6 max-w-xl text-lg md:text-xl">
            A supportive platform where students can share feedback to help teachers grow.
            All feedback is reviewed by AI to ensure it&apos;s constructive and helpful.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/teachers"
              style={{ backgroundColor: '#0D9488', color: '#ffffff' }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-medium shadow-sm transition-all duration-200 hover:opacity-90 focus-visible:outline-none"
            >
              <GraduationCap className="h-4 w-4" />
              Browse Teachers
            </Link>
            <Link
              href="/login"
              className="text-text-secondary hover:text-text-primary inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-medium transition-colors duration-200 focus-visible:outline-none"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              Pre-created Profiles
            </h3>
            <p className="text-text-secondary text-sm">
              Teachers are pre-created in the system, ensuring quality and legitimacy.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <Heart className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              AI-Powered Moderation
            </h3>
            <p className="text-text-secondary text-sm">
              All feedback is reviewed to filter out harmful content and keep it constructive.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <GraduationCap className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              Growth-focused
            </h3>
            <p className="text-text-secondary text-sm">
              Teachers see supportive summaries that help them improve, not judge them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
