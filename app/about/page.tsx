import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { siteConfig } from '../../src/config/siteConfig';

export const metadata: Metadata = {
  title: 'About UsefulHub',
  description:
    'Learn about UsefulHub’s mission, manual community curation workflow, submission guidelines, and transparent database-free architecture.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <header className="space-y-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          About {siteConfig.siteName}
        </h1>
        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {siteConfig.siteName} is a community-curated directory built to help people discover
          useful websites, tools, and resources without wasting time searching through endless
          lists.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Our mission
        </h2>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
          The modern web is full of remarkable single-purpose utilities, open-source software,
          educational platforms, and creative tools—yet search results are increasingly crowded with
          SEO filler and sponsored listicles. {siteConfig.siteName} focuses strictly on quality over
          quantity: every website listed here is real, verifiable, and chosen because it solves a
          genuine problem.
        </p>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
          We never publish fabricated popularity metrics, artificial ratings, or fake user reviews.
          If a tool includes paid tiers, we label it clearly rather than hiding its business model.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          How curation works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">01. Suggest</p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Community recommendations
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Visitors suggest websites using our validated form, which creates a structured GitHub
              Issue for transparent tracking.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">02. Review</p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Manual admin verification
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Every submission is manually checked for usefulness, safety, working HTTPS links,
              accurate descriptions, and duplicates.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">03. Publish</p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Clean public directory
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Only approved entries are added to the public JSON dataset. Rejected or pending items
              are never exposed in the directory.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Submission guidelines
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            See what types of free, open-source, and paid websites are accepted—and what gets
            automatically rejected.
          </p>
          <Link
            href="/guidelines"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Read guidelines</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Privacy &amp; transparency
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Search and bookmarks run locally in your browser with no user accounts, no database, and
            no unnecessary tracking.
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Read privacy details</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Contact &amp; corrections
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Found a broken link, outdated description, or have a question about the directory?
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{siteConfig.contactEmail}</span>
          </a>
          <Link
            href="/suggest"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <span>Suggest a Website</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
