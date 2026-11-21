'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { ThemeProvider } from '../hooks/useTheme';
import { FavoritesProvider } from '../hooks/useFavorites';
import { RandomWebsiteModal } from './RandomWebsiteModal';
import { SuggestWebsiteModal } from './SuggestWebsiteModal';

interface AppModalsContextValue {
  openRandomModal: (category?: string) => void;
  openSuggestModal: () => void;
}

const AppModalsContext = createContext<AppModalsContextValue | undefined>(undefined);

export function useAppModals(): AppModalsContextValue {
  const ctx = useContext(AppModalsContext);
  if (!ctx) {
    throw new Error('useAppModals must be used inside Providers');
  }
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [randomOpen, setRandomOpen] = useState(false);
  const [randomCategory, setRandomCategory] = useState<string>('All');
  const [suggestOpen, setSuggestOpen] = useState(false);

  const openRandomModal = useCallback((category = 'All') => {
    setRandomCategory(category);
    setRandomOpen(true);
  }, []);

  const openSuggestModal = useCallback(() => {
    setSuggestOpen(true);
  }, []);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AppModalsContext.Provider value={{ openRandomModal, openSuggestModal }}>
          {children}
          <RandomWebsiteModal
            open={randomOpen}
            initialCategory={randomCategory}
            onClose={() => setRandomOpen(false)}
          />
          <SuggestWebsiteModal
            open={suggestOpen}
            onClose={() => setSuggestOpen(false)}
          />
        </AppModalsContext.Provider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
