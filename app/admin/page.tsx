import React from 'react';
import type { Metadata } from 'next';
import { getAllCategories, getAllWebsites } from '../../src/services/websiteService';
import { AdminToolsClient } from '../../src/components/AdminToolsClient';

export const metadata: Metadata = {
  title: 'Admin Tools (Local Utility)',
  description:
    'Local browser utility for managing UsefulHub website entries, validating JSON, previewing cards, and exporting sites.json.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  const websites = getAllWebsites();
  const categories = getAllCategories();

  return <AdminToolsClient initialWebsites={websites} categories={categories} />;
}
