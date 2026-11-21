import React from 'react';
import type { Metadata } from 'next';
import { getAllWebsites } from '../../src/services/websiteService';
import { FavoritesClient } from '../../src/components/FavoritesClient';

export const metadata: Metadata = {
  title: 'Saved Favorites',
  description:
    'Access your bookmarked websites stored privately in your browser without requiring an account.',
  alternates: {
    canonical: '/favorites',
  },
};

export default function FavoritesPage() {
  const allWebsites = getAllWebsites();
  return <FavoritesClient allWebsites={allWebsites} />;
}
