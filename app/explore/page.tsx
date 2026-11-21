import React from 'react';
import type { Metadata } from 'next';
import { getAllCategories, getAllWebsites } from '../../src/services/websiteService';
import { ExploreClient } from '../../src/components/ExploreClient';
import type { SortOption } from '../../src/types/website';

export const metadata: Metadata = {
  title: 'Explore Useful Websites',
  description:
    'Search, filter, and sort every human-reviewed website, developer tool, creative app, and research resource in UsefulHub.',
  alternates: {
    canonical: '/explore',
  },
};

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const websites = getAllWebsites();
  const categories = getAllCategories();

  const initialSort: SortOption =
    params.sort === 'name' ||
    params.sort === 'alphabetical' ||
    params.sort === 'recent' ||
    params.sort === 'featured'
      ? (params.sort as SortOption)
      : 'liked';

  return (
    <ExploreClient
      websites={websites}
      categories={categories}
      initialQuery={params.q ?? ''}
      initialCategory={params.category ?? 'All'}
      initialSort={initialSort}
    />
  );
}
