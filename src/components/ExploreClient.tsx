'use client';

import React from 'react';
import { Plus, Shuffle } from 'lucide-react';
import type { CategoryDefinition, SortOption, Website } from '../types/website';
import { DirectoryBrowser } from './DirectoryBrowser';
import { useAppModals } from './Providers';

interface ExploreClientProps {
  websites: Website[];
  categories: CategoryDefinition[];
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: SortOption;
}

export function ExploreClient({
  websites,
  categories,
  initialQuery = '',
  initialCategory = 'All',
  initialSort = 'recent',
}: ExploreClientProps) {
  const { openRandomModal, openSuggestModal } = useAppModals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore the directory
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Browse every manually reviewed website in UsefulHub. Search locally with instant
            filtering and no tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openRandomModal('All')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            <span>Random Website</span>
          </button>
          <button
            type="button"
            onClick={openSuggestModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Suggest Website</span>
          </button>
        </div>
      </div>

      <DirectoryBrowser
        websites={websites}
        categories={categories}
        initialQuery={initialQuery}
        initialCategory={initialCategory}
        initialSort={initialSort}
        sectionId="explore-directory"
        heading="All approved websites"
        subheading="Use Ctrl+K / Cmd+K or type below to search across names, descriptions, tags, and URLs."
      />
    </div>
  );
}
