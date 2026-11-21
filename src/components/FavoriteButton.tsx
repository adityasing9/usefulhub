'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  websiteId: string;
  websiteName: string;
  likes?: number;
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  websiteId,
  websiteName,
  likes,
  showLabel = false,
  className = '',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites();
  const saved = mounted && isFavorite(websiteId);
  const baseLikes = typeof likes === 'number' ? likes : 0;
  const currentLikes = baseLikes + (saved ? 1 : 0);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(websiteId);
      }}
      aria-pressed={saved}
      aria-label={
        saved
          ? `Unlike ${websiteName} (${currentLikes} likes)`
          : `Like ${websiteName} (${currentLikes} likes)`
      }
      title={saved ? 'Remove from liked' : 'Like this website'}
      className={`group/btn inline-flex items-center justify-center gap-1.5 rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap shrink-0 cursor-pointer ${
        showLabel ? 'px-3 py-1.5 text-xs font-medium min-h-[34px]' : 'h-8 px-2.5 min-w-[32px]'
      } ${
        saved
          ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60'
          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/20'
      } ${className}`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform duration-150 ${
          saved ? 'fill-current text-rose-500 scale-110' : 'text-slate-400 group-hover/btn:text-rose-500'
        }`}
        aria-hidden="true"
      />
      {currentLikes > 0 && (
        <span className="font-mono text-xs font-medium tabular-nums">
          {currentLikes}
        </span>
      )}
      {showLabel && <span>{saved ? 'Liked' : 'Like'}</span>}
    </button>
  );
}
