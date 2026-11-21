import type {
  Website,
  WebsiteSubmissionInput,
  SubmissionValidationResult,
  JsonImportResult,
} from '../types/website';
import { CATEGORIES } from '../data/categories';

const SHORTENED_HOSTS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'rebrand.ly',
  'cutt.ly',
  'shorturl.at',
  'rb.gy',
  'tiny.cc',
  'lnkd.in',
]);

const SUSPICIOUS_PATTERNS = [
  /@/, // credential-in-URL phishing trick (https://trusted.com@evil.com)
  /\.(exe|scr|bat|msi|apk)(\?|$)/i,
  /xn--/i, // punycode homograph warning
];

const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];

export function normalizeUrlForComparison(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${host}${path}`;
  } catch {
    return trimmed
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '');
  }
}

export function extractHostname(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}

export function validateWebsiteUrl(rawUrl: string): {
  valid: boolean;
  error?: string;
  warnings: string[];
  normalizedUrl: string;
} {
  const trimmed = rawUrl.trim();
  const warnings: string[] = [];

  if (!trimmed) {
    return { valid: false, error: 'Website URL is required.', warnings, normalizedUrl: '' };
  }

  const lower = trimmed.toLowerCase();
  for (const proto of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(proto)) {
      return {
        valid: false,
        error: `Unsupported or unsafe URL protocol (${proto.replace(':', '')}). Use https:// instead.`,
        warnings,
        normalizedUrl: '',
      };
    }
  }

  // Reject any explicit non-http(s) scheme like ftp:, mailto:, tel:
  const schemeMatch = lower.match(/^([a-z][a-z0-9+.-]*):/);
  if (schemeMatch && schemeMatch[1] !== 'http' && schemeMatch[1] !== 'https') {
    return {
      valid: false,
      error: `Unsupported URL protocol "${schemeMatch[1]}:". Only https:// (or http://) links are allowed.`,
      warnings,
      normalizedUrl: '',
    };
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid website URL (for example, https://example.com).',
      warnings,
      normalizedUrl: '',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      error: 'Only HTTP and HTTPS URLs are supported.',
      warnings,
      normalizedUrl: '',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.includes('.') || host.startsWith('.') || host.endsWith('.')) {
    return {
      valid: false,
      error: 'URL must include a valid domain name (for example, example.com).',
      warnings,
      normalizedUrl: '',
    };
  }

  if (host === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return {
      valid: false,
      error: 'Localhost and raw IP addresses cannot be listed in the public directory.',
      warnings,
      normalizedUrl: '',
    };
  }

  if (parsed.protocol === 'http:') {
    warnings.push(
      'This URL uses HTTP instead of HTTPS. Whenever possible, use the HTTPS version of the website.'
    );
  }

  const bareHost = host.replace(/^www\./, '');
  if (SHORTENED_HOSTS.has(bareHost)) {
    warnings.push(
      `Shortened URL detected (${bareHost}). Please submit the direct destination URL so reviewers can verify safety.`
    );
  }

  if (parsed.username || parsed.password || SUSPICIOUS_PATTERNS.some((rx) => rx.test(trimmed))) {
    return {
      valid: false,
      error: 'This URL contains suspicious characters, embedded credentials, or executable file links.',
      warnings,
      normalizedUrl: '',
    };
  }

  if (parsed.search.includes('ref=') || parsed.search.includes('utm_') || parsed.search.includes('affiliate')) {
    warnings.push(
      'Tracking or referral query parameters were detected. Clean direct URLs are strongly preferred.'
    );
  }

  return {
    valid: true,
    warnings,
    normalizedUrl: parsed.toString().replace(/\/$/, ''),
  };
}

export function findDuplicateWebsite(
  url: string,
  existingSites: Website[],
  ignoreId?: string
): Website | null {
  const target = normalizeUrlForComparison(url);
  if (!target) return null;

  for (const site of existingSites) {
    if (ignoreId && site.id === ignoreId) continue;
    const existingNorm = normalizeUrlForComparison(site.url);
    if (existingNorm === target) {
      return site;
    }
  }
  return null;
}

export function validateSubmission(
  input: WebsiteSubmissionInput,
  existingSites: Website[]
): SubmissionValidationResult {
  const errors: Partial<Record<keyof WebsiteSubmissionInput, string>> = {};
  const warnings: string[] = [];

  const name = input.name.trim();
  if (!name) {
    errors.name = 'Website name is required.';
  } else if (name.length < 2 || name.length > 80) {
    errors.name = 'Website name must be between 2 and 80 characters.';
  }

  const urlCheck = validateWebsiteUrl(input.url);
  if (!urlCheck.valid && urlCheck.error) {
    errors.url = urlCheck.error;
  }
  warnings.push(...urlCheck.warnings);

  const duplicateMatch = urlCheck.valid
    ? findDuplicateWebsite(urlCheck.normalizedUrl, existingSites)
    : null;

  if (duplicateMatch) {
    warnings.push(
      `This URL appears to already be listed in UsefulHub as "${duplicateMatch.name}".`
    );
  }

  const validCategoryNames = new Set<string>(CATEGORIES.map((c) => c.name));
  if (!input.category.trim()) {
    errors.category = 'Please select a category.';
  } else if (!validCategoryNames.has(input.category.trim())) {
    errors.category = 'Please select a valid category from the list.';
  }

  const description = input.description.trim();
  if (!description) {
    errors.description = 'A short description is required.';
  } else if (description.length < 20) {
    errors.description = 'Description should be at least 20 characters so visitors understand what the site does.';
  } else if (description.length > 280) {
    errors.description = 'Keep the short description under 280 characters.';
  }

  const whyUseful = input.whyUseful.trim();
  if (!whyUseful) {
    errors.whyUseful = 'Please explain why people should use this website.';
  } else if (whyUseful.length < 15) {
    errors.whyUseful = 'Please provide at least 15 characters explaining why this site is useful.';
  } else if (whyUseful.length > 800) {
    errors.whyUseful = 'Please keep this explanation under 800 characters.';
  }

  if (input.email && input.email.trim()) {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(input.email.trim())) {
      errors.email = 'Please enter a valid email address or leave this field blank.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
    duplicateMatch,
    normalizedUrl: urlCheck.normalizedUrl,
  };
}

export function isValidSafeHref(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateSitesJsonPayload(rawData: unknown): JsonImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sites: Website[] = [];

  if (!Array.isArray(rawData)) {
    return {
      valid: false,
      sites: [],
      errors: ['JSON root must be an array of website objects.'],
      warnings: [],
    };
  }

  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();

  rawData.forEach((item, index) => {
    const row = `Entry #${index + 1}`;
    if (!item || typeof item !== 'object') {
      errors.push(`${row}: must be a JSON object.`);
      return;
    }

    const record = item as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id.trim() : '';
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    const url = typeof record.url === 'string' ? record.url.trim() : '';
    const description = typeof record.description === 'string' ? record.description.trim() : '';
    const category = typeof record.category === 'string' ? record.category.trim() : '';
    const dateAdded = typeof record.dateAdded === 'string' ? record.dateAdded.trim() : '';
    const approved = Boolean(record.approved);
    const featured = Boolean(record.featured);
    const favicon = typeof record.favicon === 'string' ? record.favicon.trim() : '';
    const pricing =
      record.pricing === 'Free' ||
      record.pricing === 'Freemium' ||
      record.pricing === 'Paid' ||
      record.pricing === 'Open Source'
        ? record.pricing
        : undefined;

    if (!id) errors.push(`${row}: missing required string field "id".`);
    if (!name) errors.push(`${row}: missing required string field "name".`);
    if (!description) errors.push(`${row}: missing required string field "description".`);
    if (!category) errors.push(`${row}: missing required string field "category".`);

    const urlCheck = validateWebsiteUrl(url);
    if (!urlCheck.valid) {
      errors.push(`${row} (${name || 'unnamed'}): ${urlCheck.error}`);
    }

    if (id && seenIds.has(id)) {
      warnings.push(`${row}: duplicate id "${id}" detected.`);
    }
    if (id) seenIds.add(id);

    const normUrl = normalizeUrlForComparison(url);
    if (normUrl && seenUrls.has(normUrl)) {
      warnings.push(`${row} (${name}): duplicate URL "${url}" detected.`);
    }
    if (normUrl) seenUrls.add(normUrl);

    if (!approved) {
      warnings.push(
        `${row} (${name || id}): "approved" is false. Only approved sites should be published in sites.json.`
      );
    }

    const tags = Array.isArray(record.tags)
      ? record.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim())
      : [];

    if (id && name && description && category && urlCheck.valid) {
      sites.push({
        id,
        name,
        url: urlCheck.normalizedUrl,
        description,
        category,
        tags,
        favicon,
        featured,
        dateAdded: /^\d{4}-\d{2}-\d{2}$/.test(dateAdded)
          ? dateAdded
          : new Date().toISOString().slice(0, 10),
        approved,
        ...(pricing ? { pricing } : {}),
      });
    }
  });

  return {
    valid: errors.length === 0,
    sites,
    errors,
    warnings,
  };
}
