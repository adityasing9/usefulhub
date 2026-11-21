'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Plus, Shuffle } from 'lucide-react';
import type { CategoryDefinition, Website } from '../types/website';
import { SearchBar } from './SearchBar';
import { WebsiteCard } from './WebsiteCard';
import { CategoryCard } from './CategoryCard';
import { DirectoryBrowser } from './DirectoryBrowser';
import { useAppModals } from './Providers';

interface HomeClientProps {
  allWebsites: Website[];
  featuredWebsites: Website[];
  recentWebsites: Website[];
  categories: CategoryDefinition[];
  categoryCounts: Record<string, number>;
}

export function HomeClient({
  allWebsites,
  featuredWebsites,
  recentWebsites,
  categories,
  categoryCounts,
}: HomeClientProps) {
  const { openRandomModal, openSuggestModal } = useAppModals();
  const [heroQuery, setHeroQuery] = useState('');

  const handleHeroSearchSubmit = (q: string) => {
    setHeroQuery(q);
    const el = document.getElementById('discover');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-slate-950">
        <div
          className="pointer-events-none absolute inset-0 hero-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-blue-50/80 via-transparent to-transparent dark:from-blue-950/30"
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-24 text-center">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Community-curated directory · Human-reviewed
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
            Discover websites that make your life easier.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto text-balance">
            Explore useful tools, hidden gems, and incredible websites recommended by a community
            of curious people.
          </p>

          <div className="mt-9 max-w-2xl mx-auto">
            <SearchBar
              value={heroQuery}
              onChange={setHeroQuery}
              onSubmit={handleHeroSearchSubmit}
              websites={allWebsites}
              size="lg"
              enableShortcut
              placeholder="Search tools, resources, categories, or tags..."
              label="Search UsefulHub directory"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Explore Directory</span>
            </Link>

            <button
              type="button"
              onClick={openSuggestModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Suggest Website</span>
            </button>

            <button
              type="button"
              onClick={() => openRandomModal('All')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Shuffle className="w-4 h-4" aria-hidden="true" />
              <span>Random Website</span>
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {allWebsites.length} verified websites across {categories.length} categories · No account required
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Featured Websites */}
        <section aria-labelledby="featured-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2
                id="featured-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Featured websites
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Editor-selected standouts known for reliability, utility, and craftsmanship.
              </p>
            </div>
            <Link
              href="/explore?sort=featured"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0"
            >
              <span>View all featured</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredWebsites.slice(0, 6).map((site) => (
              <WebsiteCard key={site.id} website={site} />
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section aria-labelledby="recent-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2
                id="recent-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Recently added
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Newest websites reviewed and approved for the directory.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0"
            >
              <span>Browse latest</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentWebsites.map((site) => (
              <WebsiteCard key={site.id} website={site} />
            ))}
          </div>
        </section>

        {/* Popular Categories */}
        <section aria-labelledby="categories-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2
                id="categories-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Browse by category
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Jump straight into a curated topic area.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0"
            >
              <span>All {categories.length} categories</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard
                key={cat.slug}
                category={cat}
                count={categoryCounts[cat.name] ?? 0}
              />
            ))}
          </div>
        </section>

        {/* Discover Websites Directory */}
        <DirectoryBrowser
          websites={allWebsites}
          categories={categories}
          externalQuery={heroQuery}
          onExternalQueryChange={setHeroQuery}
          sectionId="discover"
          heading="Discover websites"
          subheading="Search across names, descriptions, tags, and domains—or filter by category."
        />
      </div>
    </div>
  );
}
