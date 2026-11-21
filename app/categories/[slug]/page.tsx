import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategoryBySlug } from '../../../src/data/categories';
import { getWebsitesByCategory } from '../../../src/services/websiteService';
import { CategoryDetailClient } from '../../../src/components/CategoryDetailClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Websites & Tools`,
    description: `${category.description} Explore hand-reviewed ${category.name} websites on UsefulHub.`,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} — UsefulHub Directory`,
      description: category.description,
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const websites = getWebsitesByCategory(category.slug);

  return <CategoryDetailClient category={category} websites={websites} />;
}
