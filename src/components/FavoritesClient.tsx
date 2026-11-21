'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Info, Trash2 } from 'lucide-react';
import type { SortOption, Website } from '../types/website';
import { useFavorites } from '../hooks/useFavorites';
import { filterAndSearchWebsites } from '../utils/search';
import { SearchBar } from './SearchBar';
import { WebsiteGrid } from './WebsiteGrid';

interface FavoritesClientProps {
  allWebsites: Website[];
}

export function FavoritesClient({ allWebsites }: FavoritesClientProps) {
  const { favoriteIds, mounted, storageError, clearFavorites } = useFavorites();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('liked');

  const savedWebsites = useMemo(() => {
    const idSet = new Set(favoriteIds);
    return allWebsites.filter((site) => idSet.has(site.id));
  }, [allWebsites, favoriteIds]);

  const savedCategories = useMemo(
    () => Array.from(new Set(savedWebsites.map((s) => s.category))).sort(),
    [savedWebsites]
  );

  const filteredFavorites = useMemo(
    () =>
      filterAndSearchWebsites(savedWebsites, {
        query,
        category: selectedCategory,
        sort,
        favoriteIds,
      }),
    [savedWebsites, query, selectedCategory, sort, favoriteIds]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Saved Favorites
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Quick access to the websites you bookmarked while exploring UsefulHub.
          </p>
        </div>

        {mounted && savedWebsites.length > 0 && (
          <button
            type="button"
            onClick={clearFavorites}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear all ({savedWebsites.length})</span>
          </button>
        )}
      </div>

      {/* Local-Only Transparency Notice */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Your favorites are stored locally in this browser&apos;s{' '}
          <span className="font-mono text-xs">LocalStorage</span> without requiring an account.
          They do not automatically synchronize across different devices or browsers, and clearing
          browser site data will reset them.
        </p>
      </div>

      {storageError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200"
        >
          {storageError}
        </div>
      )}

      {!mounted ? (
        <WebsiteGrid websites={[]} loading />
      ) : savedWebsites.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-16 text-center space-y-4">
          <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Bookmark className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              No favorites saved yet
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Click the bookmark button on any website card to save it here for quick reference.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Explore Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={query}
                onChange={setQuery}
                websites={savedWebsites}
                placeholder="Filter your saved favorites..."
                label="Filter saved favorites"
                showSuggestions={false}
              />
            </div>

            {savedCategories.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="favorites-category" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Category
                </label>
                <select
                  id="favorites-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">All saved categories</option>
                  {savedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label htmlFor="favorites-sort" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Sort by
              </label>
              <select
                id="favorites-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="liked">Liked by (Most Liked)</option>
                <option value="name">Name (A–Z)</option>
                <option value="recent">Recently added</option>
              </select>
            </div>
          </div>

          <WebsiteGrid
            websites={filteredFavorites}
            onResetFilters={
              query || selectedCategory !== 'All'
                ? () => {
                    setQuery('');
                    setSelectedCategory('All');
                  }
                : undefined
            }
            emptyTitle="No matching favorites"
            emptyDescription="None of your saved favorites matched that filter."
          />
        </div>
      )}
    </div>
  );
}
