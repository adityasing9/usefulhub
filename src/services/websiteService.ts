import rawSitesData from '../data/sites.json';
import { CATEGORIES, getCategoryBySlug } from '../data/categories';
import type { CategoryDefinition, SortOption, Website } from '../types/website';
import { filterAndSearchWebsites, sortWebsites } from '../utils/search';
import { isValidSafeHref } from '../utils/validation';

/**
 * Isolated data access layer.
 * Currently backed by the static JSON dataset (src/data/sites.json).
 * To migrate to a database or CMS in the future, replace the implementation
 * inside this module without modifying UI components.
 */

function loadSanitizedApprovedSites(): Website[] {
  if (!Array.isArray(rawSitesData)) {
    return [];
  }

  return (rawSitesData as Website[]).filter((site) => {
    if (!site || typeof site !== 'object') return false;
    if (site.approved !== true) return false;
    if (!site.id || !site.name || !site.url || !site.description || !site.category) return false;
    if (!isValidSafeHref(site.url)) return false;
    return true;
  });
}

const APPROVED_SITES: Website[] = loadSanitizedApprovedSites();

export function getAllWebsites(): Website[] {
  return [...APPROVED_SITES];
}

export function getWebsiteById(id: string): Website | undefined {
  return APPROVED_SITES.find((site) => site.id === id);
}

export function getFeaturedWebsites(limit?: number): Website[] {
  const featured = sortWebsites(
    APPROVED_SITES.filter((site) => site.featured),
    'recent'
  );
  return typeof limit === 'number' ? featured.slice(0, limit) : featured;
}

export function getWebsitesByCategory(categoryNameOrSlug: string): Website[] {
  const bySlug = getCategoryBySlug(categoryNameOrSlug);
  const targetName = bySlug ? bySlug.name : categoryNameOrSlug;
  return sortWebsites(
    APPROVED_SITES.filter(
      (site) => site.category.toLowerCase() === targetName.toLowerCase()
    ),
    'recent'
  );
}

export function searchWebsites(
  query: string,
  options: { category?: string; sort?: SortOption } = {}
): Website[] {
  return filterAndSearchWebsites(APPROVED_SITES, {
    query,
    category: options.category,
    sort: options.sort,
  });
}

export function getRecentlyAddedWebsites(limit = 6): Website[] {
  return sortWebsites(APPROVED_SITES, 'recent').slice(0, limit);
}

export function getRandomWebsite(
  options: { category?: string; excludeId?: string } = {}
): Website | null {
  let pool = APPROVED_SITES;
  if (options.category && options.category !== 'All') {
    pool = pool.filter(
      (site) => site.category.toLowerCase() === options.category!.toLowerCase()
    );
  }
  if (pool.length === 0) return null;

  if (options.excludeId && pool.length > 1) {
    pool = pool.filter((site) => site.id !== options.excludeId);
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}

export function getAllCategories(): CategoryDefinition[] {
  return CATEGORIES;
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    counts[cat.name] = 0;
  }
  for (const site of APPROVED_SITES) {
    counts[site.category] = (counts[site.category] ?? 0) + 1;
  }
  return counts;
}
