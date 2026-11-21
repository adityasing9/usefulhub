import type { JsonImportResult, Website } from '../types/website';
import { validateSitesJsonPayload } from './validation';

export function serializeSitesJson(sites: Website[]): string {
  return JSON.stringify(sites, null, 2);
}

export function parseAndValidateSitesJson(jsonText: string): JsonImportResult {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    return {
      valid: false,
      sites: [],
      errors: ['JSON input is empty. Paste valid JSON or select a sites.json file.'],
      warnings: [],
    };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return validateSitesJsonPayload(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON syntax.';
    return {
      valid: false,
      sites: [],
      errors: [`JSON syntax error: ${message}`],
      warnings: [],
    };
  }
}

export function generateWebsiteId(name: string, existingIds: Set<string>): string {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'website';

  if (!existingIds.has(base)) return base;

  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function triggerJsonDownload(sites: Website[], filename = 'sites.json'): void {
  if (typeof window === 'undefined') return;
  const content = serializeSitesJson(sites);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
