'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Search, X, ChevronDown, MessageCircle } from 'lucide-react';

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
// Sort Options
// ============================================

const sortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'subject', label: 'Subject' },
  { value: 'feedback', label: 'Most Feedback' },
];

// ============================================
// Client Component
// ============================================

function TeachersList({ teachers }: { teachers: TeacherWithCount[] }) {
  const searchParams = useSearchParams();
  
  // Get initial subject from URL after mount to avoid SSR issues
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name-asc');
  const [isMounted, setIsMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize from URL after mount
  useEffect(() => {
    const subject = searchParams.get('subject');
    if (subject) {
      setSelectedSubject(subject);
    }
    setIsMounted(true);
  }, [searchParams]);
  
  // Keyboard shortcut: Cmd/Ctrl + K to focus search, Escape to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to split multi-subject teachers
  const getSubjects = (subject: string) => 
    subject.split('&').map(s => s.trim());
  
  // Get unique subjects for filter (flatten multi-subject entries)
  const subjects = useMemo(() => {
    const allSubjects = teachers.flatMap(t => getSubjects(t.subject));
    const uniqueSubjects = [...new Set(allSubjects)];
    return uniqueSubjects.sort();
  }, [teachers]);

  // Check if teacher teaches a specific subject (handles multi-subject)
  const teachesSubject = (teacher: TeacherWithCount, subject: string) => 
    getSubjects(teacher.subject).includes(subject);

  // Filter and sort teachers
  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    // Filter by search query (search both name AND all subjects)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        teacher =>
          teacher.name.toLowerCase().includes(query) ||
          getSubjects(teacher.subject).some(s => s.toLowerCase().includes(query))
      );
    }

    // Filter by subject (match any subject for multi-subject teachers)
    if (selectedSubject) {
      result = result.filter(teacher => teachesSubject(teacher, selectedSubject));
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'subject':
        result.sort((a, b) => a.subject.localeCompare(b.subject));
        break;
      case 'feedback':
        result.sort((a, b) => b._count.feedback - a._count.feedback);
        break;
    }

    return result;
  }, [teachers, searchQuery, selectedSubject, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject(null);
    setSortBy('name-asc');
  };

  const hasActiveFilters = searchQuery || selectedSubject;

  // Show empty state when no teachers at all
  if (teachers.length === 0) {
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
          <div className="mt-12 text-center">
            <p className="text-text-secondary">
              No teachers found. Please run the seed script to add teachers.
            </p>
          </div>
        </div>
      </section>
    );
  }

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

        {/* Search and Filters */}
        <div className="mt-8 w-full max-w-4xl mx-auto">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-lg border border-border bg-bg-card pl-10 pr-10 py-2 text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200"
              aria-label="Search teachers"
            />
            {/* Keyboard hint */}
            <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
              <span><kbd className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono">⌘K</kbd> to search</span>
              <span><kbd className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono">Esc</kbd> to clear</span>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Subject Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  selectedSubject === subject
                    ? 'bg-accent text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-card border border-border'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* Sort and Clear */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none rounded-lg border border-border bg-bg-card px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-text-muted" />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-accent hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 text-sm text-text-muted">
          {filteredTeachers.length === teachers.length
            ? `${teachers.length} teacher${teachers.length !== 1 ? 's' : ''}`
            : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-bg-card p-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-text-muted" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              No teachers found
            </h3>
            <p className="mt-2 text-text-secondary">
              Try adjusting your search or filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map(teacher => (
              <Link
                key={teacher.id}
                href={`/teachers/${teacher.id}`}
                className="group relative rounded-xl border border-border bg-bg-card p-6 shadow-sm transition-all duration-200 hover:border-accent hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent truncate">
                      {teacher.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {teacher.subject.split('&').map((sub, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent"
                        >
                          {sub.trim()}
                        </span>
                      ))}
                    </div>
                    {teacher.bio && (
                      <p className="mt-2 text-sm line-clamp-2 text-text-secondary">
                        {teacher.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Feedback Count Badge */}
                <div className="mt-4 flex items-center gap-1 text-sm text-text-muted">
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {teacher._count.feedback === 0
                      ? 'No feedback yet'
                      : `${teacher._count.feedback} feedback${teacher._count.feedback !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { TeachersList };