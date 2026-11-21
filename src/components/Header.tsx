'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Menu, Plus, X } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useFavorites } from '../hooks/useFavorites';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/categories', label: 'Categories' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const pathname = usePathname();
  const { favoriteIds, mounted } = useFavorites();
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const mobileOpen = openedOnPath === pathname;

  const toggleMobileMenu = () => {
    setOpenedOnPath((prev) => (prev === pathname ? null : pathname));
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shrink-0"
            aria-hidden="true"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </span>
          <span className="font-display">{siteConfig.siteName}</span>
        </Link>

        {/* Zone 2: Clean single-line typography nav links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const showCount = link.href === '/favorites' && mounted && favoriteIds.length > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
                  active
                    ? 'text-slate-900 dark:text-white after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-[19px] after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
                {showCount && (
                  <span className="ml-1.5 text-xs font-mono tabular-nums text-blue-600 dark:text-blue-400">
                    ({favoriteIds.length})
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Theme Toggle + Primary Action + Mobile Hamburger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />

          <Link
            href="/suggest"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Suggest a Website</span>
          </Link>

          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-1"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const showCount = link.href === '/favorites' && mounted && favoriteIds.length > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <span>{link.label}</span>
                {showCount && (
                  <span className="text-xs font-mono tabular-nums text-blue-600 dark:text-blue-400">
                    {favoriteIds.length}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/suggest"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Suggest a Website</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
