'use client';

import React from 'react';
import { SearchX } from 'lucide-react';
import type { Website } from '../types/website';
import { WebsiteCard } from './WebsiteCard';

interface WebsiteGridProps {
  websites: Website[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  onTagClick?: (tag: string) => void;
  columns?: 2 | 3;
}

export function WebsiteGrid({
  websites,
  loading = false,
  emptyTitle = 'No websites found',
  emptyDescription = 'Try adjusting your search query or selecting a different category.',
  onResetFilters,
  onTagClick,
  columns = 3,
}: WebsiteGridProps) {
  const gridCols =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-5`} aria-busy="true" aria-label="Loading websites">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800/70" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
              <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800/70" />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800/70" />
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div
        role="status"
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-14 text-center"
      >
        <div className="mx-auto inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <SearchX className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {emptyTitle}
        </h3>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {emptyDescription}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset search &amp; filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-5`} data-testid="website-grid">
      {websites.map((website) => (
        <WebsiteCard key={website.id} website={website} onTagClick={onTagClick} />
      ))}
    </div>
  );
}
