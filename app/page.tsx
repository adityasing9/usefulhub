import React from 'react';
import {
  getAllCategories,
  getAllWebsites,
  getCategoryCounts,
  getFeaturedWebsites,
  getRecentlyAddedWebsites,
} from '../src/services/websiteService';
import { HomeClient } from '../src/components/HomeClient';

export default function HomePage() {
  const allWebsites = getAllWebsites();
  const featuredWebsites = getFeaturedWebsites();
  const featuredTopIds = new Set(featuredWebsites.slice(0, 6).map((site) => site.id));
  const recentCandidates = getRecentlyAddedWebsites(14);
  const distinctRecent = recentCandidates.filter((site) => !featuredTopIds.has(site.id));
  const recentWebsites = (distinctRecent.length >= 6 ? distinctRecent : recentCandidates).slice(0, 6);
  const categories = getAllCategories();
  const categoryCounts = getCategoryCounts();

  return (
    <HomeClient
      allWebsites={allWebsites}
      featuredWebsites={featuredWebsites}
      recentWebsites={recentWebsites}
      categories={categories}
      categoryCounts={categoryCounts}
    />
  );
}
