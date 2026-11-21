import type { SortOption, Website } from '../types/website';

export interface SearchOptions {
  query?: string;
  category?: string;
  sort?: SortOption;
  favoriteIds?: string[];
}

export interface SearchSuggestion {
  label: string;
  type: 'website' | 'category' | 'tag';
  sublabel?: string;
  href?: string;
}

function scoreWebsiteMatch(site: Website, terms: string[]): number {
  const name = site.name.toLowerCase();
  const desc = site.description.toLowerCase();
  const cat = site.category.toLowerCase();
  const url = site.url.toLowerCase();
  const tags = site.tags.map((t) => t.toLowerCase());

  let totalScore = 0;

  for (const term of terms) {
    let termScore = 0;
    if (name === term) termScore += 100;
    else if (name.startsWith(term)) termScore += 60;
    else if (name.includes(term)) termScore += 40;

    if (tags.some((t) => t === term)) termScore += 35;
    else if (tags.some((t) => t.includes(term))) termScore += 22;

    if (cat.includes(term)) termScore += 20;
    if (url.includes(term)) termScore += 15;
    if (desc.includes(term)) termScore += 12;

    // Require every term to match somewhere for multi-word queries
    if (termScore === 0) return 0;
    totalScore += termScore;
  }

  return totalScore;
}

function getSiteLikes(site: Website, favoriteIds: string[] = []): number {
  const base = typeof site.likes === 'number' ? site.likes : 0;
  return base + (favoriteIds.includes(site.id) ? 1 : 0);
}

export function sortWebsites(
  sites: Website[],
  sort: SortOption = 'liked',
  favoriteIds: string[] = []
): Website[] {
  const copy = [...sites];
  switch (sort) {
    case 'liked':
      return copy.sort((a, b) => {
        const diff = getSiteLikes(b, favoriteIds) - getSiteLikes(a, favoriteIds);
        if (diff !== 0) return diff;
        return b.dateAdded.localeCompare(a.dateAdded) || a.name.localeCompare(b.name);
      });
    case 'name':
    case 'alphabetical':
      return copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    case 'featured':
      return copy.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        const diff = getSiteLikes(b, favoriteIds) - getSiteLikes(a, favoriteIds);
        if (diff !== 0) return diff;
        return b.dateAdded.localeCompare(a.dateAdded) || a.name.localeCompare(b.name);
      });
    case 'recent':
    default:
      return copy.sort(
        (a, b) => b.dateAdded.localeCompare(a.dateAdded) || a.name.localeCompare(b.name)
      );
  }
}

export function filterAndSearchWebsites(
  sites: Website[],
  options: SearchOptions = {}
): Website[] {
  const { query = '', category = 'All', sort = 'liked', favoriteIds = [] } = options;

  let filtered = sites.filter((site) => site.approved === true);

  if (category && category !== 'All') {
    const targetCat = category.toLowerCase();
    filtered = filtered.filter((site) => site.category.toLowerCase() === targetCat);
  }

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return sortWebsites(filtered, sort, favoriteIds);
  }

  const terms = trimmed.split(/\s+/).filter(Boolean);
  const scored = filtered
    .map((site) => ({ site, score: scoreWebsiteMatch(site, terms) }))
    .filter((entry) => entry.score > 0);

  if (sort === 'liked') {
    return scored
      .sort((a, b) => {
        const diff = getSiteLikes(b.site, favoriteIds) - getSiteLikes(a.site, favoriteIds);
        if (diff !== 0) return diff;
        return b.score - a.score;
      })
      .map((e) => e.site);
  }

  if (sort === 'name' || sort === 'alphabetical') {
    return scored
      .map((e) => e.site)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  if (sort === 'featured') {
    return scored
      .sort((a, b) => {
        if (a.site.featured !== b.site.featured) return a.site.featured ? -1 : 1;
        return b.score - a.score;
      })
      .map((e) => e.site);
  }

  return scored
    .sort((a, b) => b.score - a.score || b.site.dateAdded.localeCompare(a.site.dateAdded))
    .map((e) => e.site);
}

export function buildSearchSuggestions(
  sites: Website[],
  query: string,
  limit = 6
): SearchSuggestion[] {
  const approved = sites.filter((s) => s.approved);
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    const defaults: SearchSuggestion[] = [
      { label: 'AI & Machine Learning', type: 'category', sublabel: 'Category' },
      { label: 'Excalidraw', type: 'website', sublabel: 'Design & Creativity' },
      { label: 'Open Source', type: 'tag', sublabel: 'Tag' },
      { label: 'PDF', type: 'tag', sublabel: 'Tag' },
      { label: 'Privacy', type: 'tag', sublabel: 'Tag' },
      { label: 'Developer Tools', type: 'category', sublabel: 'Category' },
    ];
    return defaults.slice(0, limit);
  }

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  for (const site of approved) {
    if (
      site.name.toLowerCase().includes(trimmed) ||
      site.url.toLowerCase().includes(trimmed)
    ) {
      const key = `w:${site.name.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({
          label: site.name,
          type: 'website',
          sublabel: site.category,
        });
      }
    }
    if (suggestions.length >= limit) return suggestions;
  }

  const categories = Array.from(new Set(approved.map((s) => s.category)));
  for (const cat of categories) {
    if (cat.toLowerCase().includes(trimmed)) {
      const key = `c:${cat.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({ label: cat, type: 'category', sublabel: 'Category' });
      }
    }
    if (suggestions.length >= limit) return suggestions;
  }

  const tags = Array.from(new Set(approved.flatMap((s) => s.tags)));
  for (const tag of tags) {
    if (tag.toLowerCase().includes(trimmed)) {
      const key = `t:${tag.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push({ label: tag, type: 'tag', sublabel: 'Tag' });
      }
    }
    if (suggestions.length >= limit) return suggestions;
  }

  return suggestions;
}
