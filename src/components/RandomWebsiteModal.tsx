'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Shuffle, Star, X } from 'lucide-react';
import type { Website } from '../types/website';
import { getAllCategories, getRandomWebsite } from '../services/websiteService';
import { getCategorySlug } from '../data/categories';
import { extractHostname, isValidSafeHref } from '../utils/validation';
import { FaviconBadge } from './FaviconBadge';
import { FavoriteButton } from './FavoriteButton';

interface RandomWebsiteModalProps {
  open: boolean;
  initialCategory?: string;
  onClose: () => void;
}

export function RandomWebsiteModal({
  open,
  initialCategory = 'All',
  onClose,
}: RandomWebsiteModalProps) {
  const categories = getAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [site, setSite] = useState<Website | null>(() =>
    getRandomWebsite({ category: initialCategory })
  );
  const [isShuffling, setIsShuffling] = useState(false);

  const pickSite = useCallback((cat: string, excludeId?: string) => {
    setIsShuffling(true);
    window.setTimeout(() => {
      const next = getRandomWebsite({ category: cat, excludeId });
      setSite(next);
      setIsShuffling(false);
    }, 180);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setSelectedCategory(initialCategory);
      setSite(getRandomWebsite({ category: initialCategory }));
      setIsShuffling(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, initialCategory]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleCategoryChange = (nextCategory: string) => {
    setSelectedCategory(nextCategory);
    pickSite(nextCategory);
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="random-discovery-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2
                  id="random-discovery-title"
                  className="text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                  Random Website Discovery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selected randomly from approved directory entries
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close random website dialog"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="random-category-select"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
                >
                  Filter by category
                </label>
                <select
                  id="random-category-select"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">All approved categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-h-[188px] flex items-center">
                <AnimatePresence mode="wait">
                  {isShuffling ? (
                    <motion.div
                      key="shuffling"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="w-full py-10 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400"
                    >
                      <Shuffle className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      <span className="text-sm">Finding a useful website...</span>
                    </motion.div>
                  ) : site ? (
                    <motion.div
                      key={site.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <FaviconBadge
                            name={site.name}
                            url={site.url}
                            favicon={site.favicon}
                            size="lg"
                          />
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {site.name}
                            </h3>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                              {extractHostname(site.url)}
                            </p>
                          </div>
                        </div>
                        <FavoriteButton websiteId={site.id} websiteName={site.name} />
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {site.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <Link
                          href={`/categories/${getCategorySlug(site.category)}`}
                          onClick={onClose}
                          className="font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {site.category}
                        </Link>
                        {site.featured && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                              Featured
                            </span>
                          </>
                        )}
                        {site.pricing && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{site.pricing}</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No approved websites available in this category yet.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => pickSite(selectedCategory, site?.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Shuffle className="w-4 h-4" aria-hidden="true" />
                <span>Discover Another</span>
              </button>

              {site && isValidSafeHref(site.url) && (
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Visit {site.name}</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
