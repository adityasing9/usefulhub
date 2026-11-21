import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getAllCategories, getAllWebsites } from '../../src/services/websiteService';
import { AdminToolsClient } from '../../src/components/AdminToolsClient';
import { verifySessionToken } from '../../src/utils/adminAuth';

export const metadata: Metadata = {
  title: 'Administrator Portal — UsefulHub',
  description:
    'Secure online management portal for UsefulHub website entries, curation, and production publishing.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const websites = getAllWebsites();
  const categories = getAllCategories();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('usefulhub_admin_session')?.value;
  const initialAuthenticated = await verifySessionToken(sessionToken);

  return (
    <AdminToolsClient
      initialWebsites={websites}
      categories={categories}
      initialAuthenticated={initialAuthenticated}
    />
  );
}
