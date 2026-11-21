import React from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 dark:text-white"
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white"
                aria-hidden="true"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="font-display">{siteConfig.siteName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-sm">
              {siteConfig.tagline} A community-curated directory of genuinely practical websites,
              reviewed manually with zero tracking and zero database overhead.
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Directory</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/explore" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Explore Websites
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Saved Favorites
                </Link>
              </li>
              <li>
                <Link href="/suggest" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Suggest a Website
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Community</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  About {siteConfig.siteName}
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Submission Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacy &amp; Transparency
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Maintainer</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Admin Tools (Local)
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {year} {siteConfig.siteName}. Curated by hand, open to community suggestions.</p>
          <p>Favorites and preferences stay locally on your device.</p>
        </div>
      </div>
    </footer>
  );
}
