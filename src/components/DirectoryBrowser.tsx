'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import type { CategoryDefinition, SortOption, Website } from '../types/website';
import { siteConfig } from '../config/siteConfig';
import { filterAndSearchWebsites } from '../utils/search';
import { SearchBar } from './SearchBar';
import { WebsiteGrid } from './WebsiteGrid';

interface DirectoryBrowserProps {
  websites: Website[];
  categories: CategoryDefinition[];
  initialQuery?: string;
  initialCategory?: string;
  initialSort?: SortOption;
  sectionId?: string;
  heading?: string;
  subheading?: string;
  hideSearchBar?: boolean;
  externalQuery?: string;
  onExternalQueryChange?: (q: string) => void;
}

export function DirectoryBrowser({
  websites,
  categories,
  initialQuery = '',
  initialCategory = 'All',
  initialSort = 'recent',
  sectionId = 'discover',
  heading = 'Discover websites',
  subheading = 'Search, filter by category, or sort every approved entry in the directory.',
  hideSearchBar = false,
  externalQuery,
  onExternalQueryChange,
}: DirectoryBrowserProps) {
  const [internalQuery, setInternalQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = (next: string) => {
    if (onExternalQueryChange) onExternalQueryChange(next);
    else setInternalQuery(next);
    setPage(1);
  };

  const results = useMemo(
    () =>
      filterAndSearchWebsites(websites, {
        query,
        category: selectedCategory,
        sort,
      }),
    [websites, query, selectedCategory, sort]
  );

  const pageSize = siteConfig.itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedSites = useMemo(
    () => results.slice((safePage - 1) * pageSize, safePage * pageSize),
    [results, safePage, pageSize]
  );

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    setMobileFilterOpen(false);
  };

  const handleReset = () => {
    setQuery('');
    setSelectedCategory('All');
    setSort('recent');
    setPage(1);
  };

  return (
    <section id={sectionId} className="scroll-mt-24 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {heading}
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {subheading}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <label htmlFor={`${sectionId}-sort`} className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Sort by
          </label>
          <select
            id={`${sectionId}-sort`}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="recent">Recently added</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
            <option value="featured">Featured first</option>
          </select>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {!hideSearchBar && (
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              websites={websites}
              placeholder="Filter by name, description, tag, or domain..."
              label="Filter directory websites"
            />
          </div>
        )}

        {/* Mobile category drawer trigger */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen((prev) => !prev)}
          aria-expanded={mobileFilterOpen}
          className="md:hidden inline-flex items-center justify-between gap-2 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Category: {selectedCategory}</span>
          </span>
        </button>
      </div>

      {/* Desktop Category Filter Buttons */}
      <div
        role="group"
        aria-label="Filter by category"
        className="hidden md:flex flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => handleCategorySelect('All')}
          aria-pressed={selectedCategory === 'All'}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border dark:border-slate-800 dark:hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const active = selectedCategory === cat.name;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleCategorySelect(cat.name)}
              aria-pressed={active}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Mobile Category Filter Drawer */}
      {mobileFilterOpen && (
        <div className="md:hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Select Category
            </span>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close category filters"
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className={`px-3 py-2 text-left text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3 py-2 text-left text-xs font-medium rounded-lg truncate transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Count & Active Filter Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <p aria-live="polite" data-testid="result-count">
          Showing{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
            {results.length}
          </span>{' '}
          {results.length === 1 ? 'website' : 'websites'}
          {selectedCategory !== 'All' && (
            <>
              {' '}
              in <span className="font-medium text-slate-700 dark:text-slate-200">{selectedCategory}</span>
            </>
          )}
          {query.trim() && (
            <>
              {' '}
              matching <span className="font-medium text-slate-700 dark:text-slate-200">&ldquo;{query.trim()}&rdquo;</span>
            </>
          )}
        </p>

        {(query.trim() || selectedCategory !== 'All') && (
          <button
            type="button"
            onClick={handleReset}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Directory Grid */}
      <WebsiteGrid
        websites={paginatedSites}
        onResetFilters={handleReset}
        onTagClick={(tag) => setQuery(tag)}
        emptyTitle="No matching websites"
        emptyDescription={
          query.trim()
            ? `No approved websites matched "${query.trim()}". Try a broader keyword or clear your category filter.`
            : 'No approved websites are listed in this category yet.'
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Directory pagination"
          className="pt-4 flex items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800"
        >
          <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
