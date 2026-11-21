'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Edit3,
  Info,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type { CategoryDefinition, PricingModel, Website } from '../types/website';
import {
  findDuplicateWebsite,
  validateWebsiteUrl,
} from '../utils/validation';
import {
  generateWebsiteId,
  parseAndValidateSitesJson,
  serializeSitesJson,
  triggerJsonDownload,
} from '../utils/jsonImportExport';
import { WebsiteCard } from './WebsiteCard';

interface AdminToolsClientProps {
  initialWebsites: Website[];
  categories: CategoryDefinition[];
}

interface EditorState {
  editingId: string | null;
  name: string;
  url: string;
  category: string;
  description: string;
  tags: string;
  favicon: string;
  pricing: PricingModel;
  featured: boolean;
  dateAdded: string;
}

function createEmptyEditor(defaultCategory: string): EditorState {
  return {
    editingId: null,
    name: '',
    url: '',
    category: defaultCategory,
    description: '',
    tags: '',
    favicon: '',
    pricing: 'Free',
    featured: false,
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

export function AdminToolsClient({ initialWebsites, categories }: AdminToolsClientProps) {
  const defaultCat = categories[0]?.name ?? 'Other';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sites, setSites] = useState<Website[]>(initialWebsites);
  const [editor, setEditor] = useState<EditorState>(() => createEmptyEditor(defaultCat));
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);

  // Import panel state
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);

  const duplicateMatch = useMemo(() => {
    if (!editor.url.trim()) return null;
    const check = validateWebsiteUrl(editor.url);
    if (!check.valid) return null;
    return findDuplicateWebsite(check.normalizedUrl, sites, editor.editingId ?? undefined);
  }, [editor.url, editor.editingId, sites]);

  const previewWebsite: Website = useMemo(() => {
    const parsedTags = editor.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return {
      id: editor.editingId ?? 'preview-card',
      name: editor.name.trim() || 'Website Name Preview',
      url: editor.url.trim() || 'https://example.com',
      description:
        editor.description.trim() ||
        'Live preview of how this entry will appear in the UsefulHub public directory.',
      category: editor.category || defaultCat,
      tags: parsedTags.length > 0 ? parsedTags : ['Tag One', 'Tag Two'],
      favicon: editor.favicon.trim(),
      featured: editor.featured,
      dateAdded: editor.dateAdded || new Date().toISOString().slice(0, 10),
      approved: true,
      pricing: editor.pricing,
    };
  }, [editor, defaultCat]);

  const filteredSites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [sites, searchQuery]);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setStatusMessage(null);

    const name = editor.name.trim();
    const description = editor.description.trim();
    if (!name) {
      setFormError('Website name is required.');
      return;
    }

    const urlCheck = validateWebsiteUrl(editor.url);
    if (!urlCheck.valid) {
      setFormError(urlCheck.error ?? 'Invalid website URL.');
      return;
    }

    if (!description || description.length < 10) {
      setFormError('Description must be at least 10 characters.');
      return;
    }

    const duplicate = findDuplicateWebsite(
      urlCheck.normalizedUrl,
      sites,
      editor.editingId ?? undefined
    );
    if (duplicate) {
      setFormError(`Duplicate URL: "${duplicate.name}" already uses this URL.`);
      return;
    }

    const tags = editor.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editor.editingId) {
      setSites((prev) =>
        prev.map((item) =>
          item.id === editor.editingId
            ? {
                ...item,
                name,
                url: urlCheck.normalizedUrl,
                category: editor.category,
                description,
                tags,
                favicon: editor.favicon.trim(),
                pricing: editor.pricing,
                featured: editor.featured,
                dateAdded: editor.dateAdded,
                approved: true,
              }
            : item
        )
      );
      setStatusMessage(`Updated "${name}" locally. Download sites.json to publish.`);
    } else {
      const existingIds = new Set(sites.map((s) => s.id));
      const newId = generateWebsiteId(name, existingIds);
      const created: Website = {
        id: newId,
        name,
        url: urlCheck.normalizedUrl,
        description,
        category: editor.category,
        tags,
        favicon: editor.favicon.trim(),
        featured: editor.featured,
        dateAdded: editor.dateAdded,
        approved: true,
        pricing: editor.pricing,
      };
      setSites((prev) => [created, ...prev]);
      setStatusMessage(`Added "${name}" locally. Download sites.json to publish.`);
    }

    setEditor(createEmptyEditor(defaultCat));
  };

  const handleEdit = (site: Website) => {
    setFormError(null);
    setStatusMessage(null);
    setEditor({
      editingId: site.id,
      name: site.name,
      url: site.url,
      category: site.category,
      description: site.description,
      tags: site.tags.join(', '),
      favicon: site.favicon ?? '',
      pricing: site.pricing ?? 'Free',
      featured: site.featured,
      dateAdded: site.dateAdded,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (site: Website) => {
    setSites((prev) => prev.filter((item) => item.id !== site.id));
    if (editor.editingId === site.id) {
      setEditor(createEmptyEditor(defaultCat));
    }
    setStatusMessage(`Removed "${site.name}" from local dataset.`);
  };

  const handleToggleFeatured = (id: string) => {
    setSites((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item))
    );
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(serializeSitesJson(sites));
      setCopiedJson(true);
      setStatusMessage('Copied full sites.json payload to clipboard.');
      window.setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      setFormError('Could not copy to clipboard in this browser context. Use Download JSON instead.');
    }
  };

  const handleDownloadJson = () => {
    triggerJsonDownload(sites, 'sites.json');
    setStatusMessage('Downloaded updated sites.json. Replace src/data/sites.json and push to GitHub.');
  };

  const handleImportApply = (rawText: string) => {
    setImportErrors([]);
    setImportWarnings([]);
    const parsed = parseAndValidateSitesJson(rawText);
    if (!parsed.valid) {
      setImportErrors(parsed.errors);
      setImportWarnings(parsed.warnings);
      return;
    }
    const approvedOnly = parsed.sites.filter((s) => s.approved);
    setSites(approvedOnly);
    setImportWarnings(parsed.warnings);
    setImportOpen(false);
    setImportText('');
    setStatusMessage(
      `Imported ${approvedOnly.length} approved website${approvedOnly.length === 1 ? '' : 's'} into local workspace.`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setImportText(text);
      setImportOpen(true);
      handleImportApply(text);
    };
    reader.onerror = () => {
      setImportErrors(['Failed to read selected file.']);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header & Local-Only Notice */}
      <div className="space-y-5 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Local Admin Utility
            </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Manage approved websites, validate URLs, preview cards, and export updated JSON data
              for your repository.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileUpload}
              className="sr-only"
              aria-label="Upload sites.json file"
            />
            <button
              type="button"
              onClick={() => setImportOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Import JSON</span>
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copiedJson ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download sites.json</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSites(initialWebsites);
                setEditor(createEmptyEditor(defaultCat));
                setStatusMessage('Reset local editor to bundled sites.json.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 dark:border-blue-900/70 bg-blue-50/70 dark:bg-blue-950/30 p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            The admin utility edits data locally in your browser. To publish your changes, download
            the updated JSON file and replace the project&apos;s{' '}
            <code className="font-mono text-xs">src/data/sites.json</code> file, then push your
            changes to GitHub.
          </p>
        </div>

        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200"
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* JSON Import Panel */}
      {importOpen && (
        <section
          aria-labelledby="import-json-heading"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="import-json-heading" className="text-base font-semibold text-slate-900 dark:text-white">
                Import &amp; Validate sites.json
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste JSON below or load a local <code className="font-mono">.json</code> file. All URLs and required fields are strictly validated.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Choose JSON File</span>
            </button>
          </div>

          <textarea
            rows={7}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[ { "id": "example", "name": "Example", "url": "https://example.com", ... } ]'
            aria-label="Paste sites JSON"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {importErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/30 p-3.5 space-y-1 text-xs text-red-800 dark:text-red-200"
            >
              <p className="font-semibold">Import validation failed:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {importErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {importWarnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/30 p-3.5 space-y-1 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Warnings:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {importWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleImportApply(importText)}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Validate &amp; Import
            </button>
            <button
              type="button"
              onClick={() => {
                setImportOpen(false);
                setImportErrors([]);
                setImportWarnings([]);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Add / Edit Form + Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section
          aria-labelledby="editor-heading"
          className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="editor-heading" className="text-lg font-semibold text-slate-900 dark:text-white">
              {editor.editingId ? 'Edit Website Entry' : 'Add Approved Website'}
            </h2>
            {editor.editingId && (
              <button
                type="button"
                onClick={() => setEditor(createEmptyEditor(defaultCat))}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel editing
              </button>
            )}
          </div>

          <form onSubmit={handleSaveEntry} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website Name *
                </label>
                <input
                  id="admin-name"
                  type="text"
                  required
                  value={editor.name}
                  onChange={(e) => setEditor((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. MDN Web Docs"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label htmlFor="admin-url" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website URL *
                </label>
                <input
                  id="admin-url"
                  type="url"
                  required
                  value={editor.url}
                  onChange={(e) => setEditor((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://developer.mozilla.org"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {duplicateMatch && (
              <div
                role="alert"
                className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/30 p-3 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span>
                  Duplicate URL detected: already listed as <strong>{duplicateMatch.name}</strong>.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="admin-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  id="admin-category"
                  value={editor.category}
                  onChange={(e) => setEditor((p) => ({ ...p, category: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="admin-pricing" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pricing Label
                </label>
                <select
                  id="admin-pricing"
                  value={editor.pricing}
                  onChange={(e) => setEditor((p) => ({ ...p, pricing: e.target.value as PricingModel }))}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>

              <div>
                <label htmlFor="admin-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Approval Date
                </label>
                <input
                  id="admin-date"
                  type="date"
                  value={editor.dateAdded}
                  onChange={(e) => setEditor((p) => ({ ...p, dateAdded: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-description" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description *
              </label>
              <textarea
                id="admin-description"
                rows={2}
                required
                value={editor.description}
                onChange={(e) => setEditor((p) => ({ ...p, description: e.target.value }))}
                placeholder="Accurate 1-2 sentence summary of what this website offers."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-tags" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  id="admin-tags"
                  type="text"
                  value={editor.tags}
                  onChange={(e) => setEditor((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="Docs, Reference, Web"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label htmlFor="admin-favicon" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Favicon URL (optional)
                </label>
                <input
                  id="admin-favicon"
                  type="url"
                  value={editor.favicon}
                  onChange={(e) => setEditor((p) => ({ ...p, favicon: e.target.value }))}
                  placeholder="Leave blank for automatic domain favicon"
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editor.featured}
                  onChange={(e) => setEditor((p) => ({ ...p, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>Mark as Featured</span>
              </label>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{editor.editingId ? 'Save Changes' : 'Add Website'}</span>
              </button>
            </div>

            {formError && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {formError}
              </p>
            )}
          </form>
        </section>

        {/* Live Card Preview */}
        <aside className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Live Card Preview
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updates as you type
            </span>
          </div>
          <WebsiteCard website={previewWebsite} disableFavorite />
        </aside>
      </div>

      {/* Existing Directory Table */}
      <section aria-labelledby="manage-list-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="manage-list-heading" className="text-xl font-semibold text-slate-900 dark:text-white">
              Approved Websites ({sites.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search, toggle featured status, edit details, or remove entries.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              aria-label="Search existing websites"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date Added</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredSites.map((site) => (
                <tr
                  key={site.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{site.name}</div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {site.url}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {site.category}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {site.dateAdded}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(site.id)}
                      aria-pressed={site.featured}
                      aria-label={
                        site.featured
                          ? `Remove ${site.name} from featured`
                          : `Mark ${site.name} as featured`
                      }
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                        site.featured
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${site.featured ? 'fill-current' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(site)}
                        aria-label={`Edit ${site.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(site)}
                        aria-label={`Delete ${site.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSites.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    No websites matched &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
