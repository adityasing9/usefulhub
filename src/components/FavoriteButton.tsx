'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  websiteId: string;
  websiteName: string;
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  websiteId,
  websiteName,
  showLabel = false,
  className = '',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites();
  const saved = mounted && isFavorite(websiteId);

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
          ? `Remove ${websiteName} from favorites`
          : `Save ${websiteName} to favorites`
      }
      title={saved ? 'Remove from favorites' : 'Save to favorites'}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 whitespace-nowrap shrink-0 cursor-pointer ${
        showLabel ? 'px-3 py-2 text-xs font-medium min-h-[36px]' : 'w-9 h-9'
      } ${
        saved
          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25'
          : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:border-slate-600'
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 ${saved ? 'fill-current' : ''}`}
        aria-hidden="true"
      />
      {showLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
