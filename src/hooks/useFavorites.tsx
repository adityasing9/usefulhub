'use client';

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from 'react';

const FAVORITES_STORAGE_KEY = 'usefulhub_favorites_v1';

interface FavoritesContextValue {
  favoriteIds: string[];
  mounted: boolean;
  storageError: string | null;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const emptySubscribe = () => () => {};

function readInitialFavorites(): { ids: string[]; error: string | null } {
  if (typeof window === 'undefined') {
    return { ids: [], error: null };
  }
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return {
          ids: parsed.filter((item): item is string => typeof item === 'string'),
          error: null,
        };
      }
    }
    return { ids: [], error: null };
  } catch {
    return {
      ids: [],
      error:
        'Local storage is unavailable in this browser session. Bookmarks will work temporarily until you close this tab.',
    };
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [initial] = useState(() => readInitialFavorites());
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initial.ids);
  const [storageError, setStorageError] = useState<string | null>(initial.error);

  const persist = useCallback((nextIds: string[]) => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextIds));
      setStorageError(null);
    } catch {
      setStorageError(
        'Could not save favorites to LocalStorage. Your browser may be in private mode or storage may be full.'
      );
    }
  }, []);

  const isFavorite = useCallback(
    (id: string) => mounted && favoriteIds.includes(id),
    [favoriteIds, mounted]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavoriteIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [id, ...prev];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavoriteIds((prev) => {
        const next = prev.filter((item) => item !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    persist([]);
  }, [persist]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds: mounted ? favoriteIds : [],
        mounted,
        storageError,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
