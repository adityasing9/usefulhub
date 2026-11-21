import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '../../src/config/siteConfig';

export const metadata: Metadata = {
  title: 'Privacy & Transparency',
  description:
    'Understand how UsefulHub protects your privacy with local bookmarks, local search, zero database storage, and no hidden tracking.',
  alternates: {
    canonical: '/privacy',
  },
};

const PRIVACY_SECTIONS = [
  {
    title: '01. Local Favorites & Preferences',
    body: 'Your bookmarked websites and light/dark theme preference are stored solely in your browser’s LocalStorage. This information never leaves your device, is never sent to a server, and can be cleared at any time from the Favorites page or your browser settings.',
  },
  {
    title: '02. Client-Side Search',
    body: 'All searching, filtering, and category sorting happen locally inside your browser against the public directory dataset. Your search queries are not logged to a backend database.',
  },
  {
    title: '03. No User Accounts & No Database',
    body: `${siteConfig.siteName} does not require registration, passwords, or personal profiles. The directory itself operates without a traditional database, storing only public, admin-approved website listings in a static JSON file.`,
  },
  {
    title: '04. Community Submissions via GitHub or Google Forms',
    body: 'When you choose to submit a website suggestion through GitHub Issues, your submission is processed and hosted by GitHub under GitHub’s Privacy Statement (and public repository issues are visible to others). If the maintainer has enabled an optional Google Forms link and you choose to use it, that submission is handled by Google under Google’s Privacy Policy. Optional contact details should only be provided if you are comfortable sharing them through those platforms.',
  },
  {
    title: '05. External Websites',
    body: `${siteConfig.siteName} links to independent third-party websites across the internet. External links open in a new tab with rel="noopener noreferrer", and each external website is governed by its own privacy policy and terms of service.`,
  },
  {
    title: '06. No Unnecessary Tracking',
    body: 'We do not embed invasive advertising trackers, third-party behavioral scripts, or hidden analytics telemetry. Core functionality works without API keys or tracking cookies.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Privacy &amp; Transparency
        </h1>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
          {siteConfig.siteName} is designed to be fast, lightweight, and respectful of your privacy.
          Here is a plain-language summary of how data works on this platform.
        </p>
      </header>

      <div className="space-y-6">
        {PRIVACY_SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Questions about privacy or data handling? Contact{' '}
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
        >
          {siteConfig.contactEmail}
        </a>
        .
      </p>
    </div>
  );
}
