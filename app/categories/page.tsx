import React from 'react';
import type { Metadata } from 'next';
import { getAllCategories, getCategoryCounts } from '../../src/services/websiteService';
import { CategoryCard } from '../../src/components/CategoryCard';

export const metadata: Metadata = {
  title: 'Categories',
  description:
    'Browse useful websites organized across 16 curated categories including AI, Developer Tools, Design, Productivity, Education, Research, and Security.',
  alternates: {
    canonical: '/categories',
  },
};

export default function CategoriesPage() {
  const categories = getAllCategories();
  const counts = getCategoryCounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-2 pb-8 border-b border-slate-200 dark:border-slate-800 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Browse by category
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Every website in UsefulHub is organized into a focused topic area so you can find
          practical tools without sifting through clutter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            count={counts[category.name] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
