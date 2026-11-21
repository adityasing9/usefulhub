'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import type { Website } from '../types/website';
import { getCategorySlug } from '../data/categories';
import { extractHostname, isValidSafeHref } from '../utils/validation';
import { FaviconBadge } from './FaviconBadge';
import { FavoriteButton } from './FavoriteButton';

interface WebsiteCardProps {
  website: Website;
  showTags?: boolean;
  onTagClick?: (tag: string) => void;
  disableFavorite?: boolean;
}

export function WebsiteCard({
  website,
  showTags = true,
  onTagClick,
  disableFavorite = false,
}: WebsiteCardProps) {
  const safeHref = isValidSafeHref(website.url) ? website.url : '#';
  const hostname = extractHostname(website.url);
  const categorySlug = getCategorySlug(website.category);

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FaviconBadge
              name={website.name}
              url={website.url}
              favicon={website.favicon}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {website.name}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                {hostname}
              </p>
            </div>
          </div>

          {!disableFavorite && (
            <FavoriteButton websiteId={website.id} websiteName={website.name} />
          )}
        </div>

        <p className="mt-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
          {website.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href={`/categories/${categorySlug}`}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {website.category}
          </Link>

          {website.featured && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                Featured
              </span>
            </>
          )}

          {website.pricing && (
            <>
              <span aria-hidden="true">·</span>
              <span>{website.pricing}</span>
            </>
          )}
        </div>

        {showTags && website.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
            {website.tags.slice(0, 4).map((tag, idx) => (
              <React.Fragment key={tag}>
                {idx > 0 && <span aria-hidden="true">/</span>}
                {onTagClick ? (
                  <button
                    type="button"
                    onClick={() => onTagClick(tag)}
                    className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ) : (
                  <span>{tag}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="pt-1 flex items-center justify-between gap-2">
          <span className="text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500">
            Added {website.dateAdded}
          </span>
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md px-1 -mr-1"
          >
            <span>Visit Website</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
