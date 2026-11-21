import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { siteConfig } from '../../src/config/siteConfig';

export const metadata: Metadata = {
  title: 'Submission Guidelines',
  description:
    'Review the quality standards for submitting websites to UsefulHub, including accepted categories, paid tool policies, and automatic rejection criteria.',
  alternates: {
    canonical: '/guidelines',
  },
};

const ACCEPTED_ITEMS = [
  'Free online tools and single-purpose utilities',
  'Paid or freemium tools, clearly labeled with pricing expectations',
  'Educational resources, courses, and reference libraries',
  'Developer tools, documentation, and testing sandboxes',
  'Productivity and everyday workflow applications',
  'Creative, design, writing, and multimedia tools',
  'Academic and scientific research resources',
  'Open-source software projects and community directories',
  'Trustworthy online services with genuine everyday utility',
];

const REJECTED_ITEMS = [
  'Scam websites, deceptive dark patterns, or fraudulent services',
  'Malware, adware, browser hijackers, or suspicious downloads',
  'Phishing domains or lookalike impersonation sites',
  'Illegal services or pirated content portals',
  'Spam, auto-generated content farms, or doorway pages',
  'Low-quality affiliate link aggregators and referral redirects',
  'Misleading websites making unverifiable or fake claims',
  'Duplicate submissions already listed in the directory',
  'Shortened URLs that hide the real destination',
  'Websites with no clear, practical utility for visitors',
];

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Submission Guidelines
        </h1>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
          Every website recommended to {siteConfig.siteName} is reviewed manually before appearing
          in the public directory. These standards keep the catalog trustworthy, concise, and useful.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              What we accept
            </h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
            {ACCEPTED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
              <X className="w-4 h-4" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              What we reject
            </h2>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
            {REJECTED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Policy on paid websites
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          We do <strong>not</strong> automatically reject a website because it charges money or
          offers paid subscriptions. Many great tools are sustainably funded by their users.
          However, paid or freemium websites must deliver genuine value and are clearly labeled
          (Free, Freemium, Paid, or Open Source) where known so visitors know what to expect before
          clicking.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Have a website that fits these guidelines?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Submit it for manual review in under a minute.
          </p>
        </div>
        <Link
          href="/suggest"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          Suggest a Website
        </Link>
      </section>
    </div>
  );
}
