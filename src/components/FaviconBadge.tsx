'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { extractHostname } from '../utils/validation';

interface FaviconBadgeProps {
  name: string;
  url: string;
  favicon?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PLACEHOLDER_HOSTS = new Set(['example.com', 'example.org', 'example.net', 'localhost']);

export function FaviconBadge({ name, url, favicon, size = 'md' }: FaviconBadgeProps) {
  const hostname = extractHostname(url);
  const isPlaceholder = PLACEHOLDER_HOSTS.has(hostname.toLowerCase());
  const resolvedFavicon =
    favicon && favicon.trim()
      ? favicon.trim()
      : hostname && hostname.includes('.') && !isPlaceholder
        ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`
        : '';

  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const loaded = Boolean(resolvedFavicon) && loadedSrc === resolvedFavicon;
  const failed = Boolean(resolvedFavicon) && failedSrc === resolvedFavicon;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const boxSize =
    size === 'lg'
      ? 'w-12 h-12 rounded-xl text-sm'
      : size === 'sm'
        ? 'w-8 h-8 rounded-lg text-xs'
        : 'w-10 h-10 rounded-lg text-xs';

  const imgSize = size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div
      className={`relative shrink-0 ${boxSize} flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold select-none overflow-hidden`}
      aria-hidden="true"
    >
      {(!loaded || failed || !resolvedFavicon) && (
        <span className="flex items-center justify-center font-display tracking-tight">
          {initials || <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
        </span>
      )}
      {resolvedFavicon && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={resolvedFavicon}
          src={resolvedFavicon}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedSrc(resolvedFavicon)}
          onError={() => setFailedSrc(resolvedFavicon)}
          className={`${imgSize} object-contain transition-opacity duration-150 ${
            loaded ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />
      )}
    </div>
  );
}
