import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { SuggestWebsiteForm } from '../../src/components/SuggestWebsiteForm';
import { siteConfig } from '../../src/config/siteConfig';

export const metadata: Metadata = {
  title: 'Suggest a Website',
  description:
    'Recommend a genuinely useful website, tool, or resource to UsefulHub. All community suggestions are manually reviewed before publishing.',
  alternates: {
    canonical: '/suggest',
  },
};

export default function SuggestPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-2 pb-8 border-b border-slate-200 dark:border-slate-800 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Suggest a website
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Know a practical tool, hidden gem, or trustworthy resource worth bookmarking? Validate
          your suggestion below and submit it through our zero-database GitHub Issue workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <SuggestWebsiteForm />
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>How review works</span>
            </div>
            <ol className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 list-decimal pl-4">
              <li>Fill out the form to validate the URL and check for duplicates.</li>
              <li>Open the pre-filled GitHub Issue form and click submit on GitHub.</li>
              <li>The directory admin checks usefulness, safety, and category fit.</li>
              <li>Approved websites are added to the public directory dataset.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Before submitting</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li>Use direct HTTPS links without URL shorteners or affiliate tracking.</li>
              <li>Paid tools are welcome—please mention if payment is required.</li>
              <li>No scams, spam, or duplicate listings.</li>
            </ul>
            <div className="pt-1">
              <Link
                href="/guidelines"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Read full Submission Guidelines →
              </Link>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
            No GitHub account? After validating the form, you can copy a clean summary or email it
            directly to <span className="font-mono">{siteConfig.contactEmail}</span>.
          </p>
        </aside>
      </div>
    </div>
  );
}
