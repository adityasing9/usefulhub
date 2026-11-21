'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  RotateCcw,
} from 'lucide-react';
import { isGitHubConfigured, siteConfig } from '../config/siteConfig';
import { getAllCategories, getAllWebsites } from '../services/websiteService';
import type { WebsiteSubmissionInput } from '../types/website';
import {
  findDuplicateWebsite,
  validateSubmission,
  validateWebsiteUrl,
} from '../utils/validation';
import {
  buildEmailFallbackUrl,
  buildGitHubSubmissionUrl,
  buildPlainTextSubmissionSummary,
} from '../utils/githubSubmission';

interface SuggestWebsiteFormProps {
  compact?: boolean;
  onSuccessClose?: () => void;
}

const INITIAL_FORM: WebsiteSubmissionInput = {
  name: '',
  url: '',
  category: '',
  description: '',
  whyUseful: '',
  submitterName: '',
  email: '',
  tags: '',
};

export function SuggestWebsiteForm({ compact = false, onSuccessClose }: SuggestWebsiteFormProps) {
  const categories = useMemo(() => getAllCategories(), []);
  const existingSites = useMemo(() => getAllWebsites(), []);
  const hasGoogleForms = Boolean(siteConfig.googleFormsUrl.trim());
  const githubConfigured = isGitHubConfigured(siteConfig);

  const [form, setForm] = useState<WebsiteSubmissionInput>(INITIAL_FORM);
  const [method, setMethod] = useState<'github' | 'google-forms'>('github');
  const [errors, setErrors] = useState<Partial<Record<keyof WebsiteSubmissionInput, string>>>({});
  const [submittedPayload, setSubmittedPayload] = useState<{
    githubUrl: string;
    emailUrl: string;
    plainSummary: string;
    normalizedUrl: string;
    warnings: string[];
    name: string;
    category: string;
  } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Real-time duplicate & URL safety check as user enters URL
  const liveUrlFeedback = useMemo(() => {
    if (!form.url.trim()) return null;
    const check = validateWebsiteUrl(form.url);
    const duplicate = check.valid ? findDuplicateWebsite(check.normalizedUrl, existingSites) : null;
    return { ...check, duplicate };
  }, [form.url, existingSites]);

  const updateField = <K extends keyof WebsiteSubmissionInput>(
    field: K,
    value: WebsiteSubmissionInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSubmission(form, existingSites);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const githubUrl = buildGitHubSubmissionUrl(form, validation.normalizedUrl, siteConfig);
    const emailUrl = buildEmailFallbackUrl(form, validation.normalizedUrl, siteConfig);
    const plainSummary = buildPlainTextSubmissionSummary(form, validation.normalizedUrl);

    setErrors({});
    setSubmittedPayload({
      githubUrl,
      emailUrl,
      plainSummary,
      normalizedUrl: validation.normalizedUrl,
      warnings: validation.warnings,
      name: form.name.trim(),
      category: form.category.trim(),
    });
    if (!compact && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopySummary = async () => {
    if (!submittedPayload) return;
    try {
      await navigator.clipboard.writeText(submittedPayload.plainSummary);
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      setCopiedSummary(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmittedPayload(null);
    setCopiedSummary(false);
  };

  if (submittedPayload) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Suggestion ready to submit on{' '}
                {method === 'google-forms' && hasGoogleForms ? 'Google Forms' : 'GitHub'}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Your details passed validation, but <strong>nothing has been saved yet</strong>.
                Because {siteConfig.siteName} operates without a database, please click the button
                below to complete and submit your suggestion on{' '}
                {method === 'google-forms' && hasGoogleForms ? 'Google Forms' : 'GitHub'}.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your suggestion will be reviewed by the admin. If approved, it will appear in the
                directory.
              </p>
            </div>
          </div>
        </div>

        {!githubConfigured && method === 'github' && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200">
            <p className="font-medium">Repository configuration reminder</p>
            <p className="mt-1 text-xs leading-relaxed">
              The site owner has not yet replaced the placeholder GitHub username in{' '}
              <code className="font-mono">src/config/siteConfig.ts</code>. Once updated to your real
              repository, the GitHub submission button below will open your live Issue Form directly.
            </p>
          </div>
        )}

        {submittedPayload.warnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Notices to keep in mind
            </p>
            <ul className="list-disc pl-5 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              {submittedPayload.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {submittedPayload.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {submittedPayload.category}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
            {submittedPayload.normalizedUrl}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {method === 'google-forms' && hasGoogleForms ? (
            <a
              href={siteConfig.googleFormsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <span>Open Google Form</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          ) : (
            <a
              href={submittedPayload.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <span>Open Pre-filled GitHub Issue</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Copied Details</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Submit another</span>
          </button>

          {onSuccessClose && (
            <button
              type="button"
              onClick={onSuccessClose}
              className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Do not have a GitHub account?
          </h4>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            You can create a free GitHub account in under a minute, or copy the summary above and
            email it directly to the directory maintainer for manual review.
          </p>
          <a
            href={submittedPayload.emailUrl}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Send suggestion via email ({siteConfig.contactEmail})</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {hasGoogleForms && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Submission method
          </legend>
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMethod('github')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                method === 'github'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Submit via GitHub Issues
            </button>
            <button
              type="button"
              onClick={() => setMethod('google-forms')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                method === 'google-forms'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Submit via Google Forms
            </button>
          </div>
        </fieldset>
      )}

      <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-4`}>
        <div>
          <label
            htmlFor="suggest-name"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Website Name <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            id="suggest-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Excalidraw"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'suggest-name-error' : undefined}
            className={`w-full h-11 rounded-lg border px-3.5 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.name
                ? 'border-red-500 dark:border-red-500'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          />
          {errors.name && (
            <p id="suggest-name-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="suggest-url"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Website URL <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            id="suggest-url"
            name="url"
            type="url"
            required
            value={form.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://example.com"
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? 'suggest-url-error' : 'suggest-url-hint'}
            className={`w-full h-11 rounded-lg border px-3.5 text-sm font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.url
                ? 'border-red-500 dark:border-red-500'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          />
          {errors.url ? (
            <p id="suggest-url-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.url}
            </p>
          ) : (
            <p id="suggest-url-hint" className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Use the direct HTTPS URL without link shorteners.
            </p>
          )}
        </div>
      </div>

      {liveUrlFeedback && (liveUrlFeedback.duplicate || liveUrlFeedback.warnings.length > 0) && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/80 dark:bg-amber-950/30 p-3.5 space-y-1.5"
        >
          {liveUrlFeedback.duplicate && (
            <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>
                <strong>Duplicate detected:</strong> This website is already listed in{' '}
                {siteConfig.siteName} as <strong>{liveUrlFeedback.duplicate.name}</strong> (
                {liveUrlFeedback.duplicate.category}).
              </span>
            </div>
          )}
          {liveUrlFeedback.warnings.map((warning) => (
            <div
              key={warning}
              className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-4`}>
        <div>
          <label
            htmlFor="suggest-category"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Category <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <select
            id="suggest-category"
            name="category"
            required
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'suggest-category-error' : undefined}
            className={`w-full h-11 rounded-lg border px-3 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.category
                ? 'border-red-500 dark:border-red-500'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p id="suggest-category-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.category}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="suggest-tags"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Tags <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="suggest-tags"
            name="tags"
            type="text"
            value={form.tags ?? ''}
            onChange={(e) => updateField('tags', e.target.value)}
            placeholder="e.g. Open Source, Diagrams, Free"
            className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="suggest-description"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Short Description <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {form.description.trim().length}/280
          </span>
        </div>
        <textarea
          id="suggest-description"
          name="description"
          required
          rows={2}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Concisely describe what this website does in 1-2 sentences."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'suggest-description-error' : undefined}
          className={`w-full rounded-lg border p-3 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.description
              ? 'border-red-500 dark:border-red-500'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        />
        {errors.description && (
          <p id="suggest-description-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="suggest-why"
          className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
        >
          Why should people use this website? <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <textarea
          id="suggest-why"
          name="whyUseful"
          required
          rows={3}
          value={form.whyUseful}
          onChange={(e) => updateField('whyUseful', e.target.value)}
          placeholder="Share what makes it practical, reliable, or worth bookmarking. Mention if it has paid tiers."
          aria-invalid={Boolean(errors.whyUseful)}
          aria-describedby={errors.whyUseful ? 'suggest-why-error' : undefined}
          className={`w-full rounded-lg border p-3 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.whyUseful
              ? 'border-red-500 dark:border-red-500'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        />
        {errors.whyUseful && (
          <p id="suggest-why-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.whyUseful}
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-4`}>
        <div>
          <label
            htmlFor="suggest-submitter"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Your Name <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="suggest-submitter"
            name="submitterName"
            type="text"
            value={form.submitterName ?? ''}
            onChange={(e) => updateField('submitterName', e.target.value)}
            placeholder="Name or handle"
            className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="suggest-email"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
          >
            Email Address <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="suggest-email"
            name="email"
            type="email"
            value={form.email ?? ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'suggest-email-error' : undefined}
            className={`w-full h-11 rounded-lg border px-3.5 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.email
                ? 'border-red-500 dark:border-red-500'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          />
          {errors.email && (
            <p id="suggest-email-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All suggestions are reviewed manually against our{' '}
          <Link href="/guidelines" className="text-blue-600 dark:text-blue-400 hover:underline">
            Submission Guidelines
          </Link>
          .
        </p>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <span>Validate &amp; Prepare Submission</span>
        </button>
      </div>
    </form>
  );
}
