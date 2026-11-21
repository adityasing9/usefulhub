'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shuffle } from 'lucide-react';
import type { CategoryDefinition, SortOption, Website } from '../types/website';
import { filterAndSearchWebsites } from '../utils/search';
import { CategoryIcon } from './CategoryIcon';
import { SearchBar } from './SearchBar';
import { WebsiteGrid } from './WebsiteGrid';
import { useAppModals } from './Providers';

interface CategoryDetailClientProps {
  category: CategoryDefinition;
  websites: Website[];
}

export function CategoryDetailClient({ category, websites }: CategoryDetailClientProps) {
  const { openRandomModal } = useAppModals();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const filtered = useMemo(
    () => filterAndSearchWebsites(websites, { query, sort }),
    [websites, query, sort]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>All categories</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400 shrink-0">
              <CategoryIcon icon={category.icon} className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {category.name}
              </h1>
              <p className="mt-1.5 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                {category.description}
              </p>
              <p className="mt-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {websites.length} approved {websites.length === 1 ? 'website' : 'websites'} in this category
              </p>
            </div>
          </div>

          {websites.length > 0 && (
            <button
              type="button"
              onClick={() => openRandomModal(category.name)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              <Shuffle className="w-4 h-4" aria-hidden="true" />
              <span>Random in {category.name}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            websites={websites}
            placeholder={`Search within ${category.name}...`}
            label={`Search websites in ${category.name}`}
            showSuggestions={false}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <label htmlFor="category-sort" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Sort by
          </label>
          <select
            id="category-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="recent">Recently added</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
            <option value="featured">Featured first</option>
          </select>
        </div>
      </div>

      <WebsiteGrid
        websites={filtered}
        onResetFilters={query ? () => setQuery('') : undefined}
        onTagClick={(tag) => setQuery(tag)}
        emptyTitle={`No websites matched in ${category.name}`}
        emptyDescription={
          query
            ? `No sites in ${category.name} matched "${query}".`
            : `No websites are listed under ${category.name} yet. Have a great recommendation?`
        }
      />
    </div>
  );
}
