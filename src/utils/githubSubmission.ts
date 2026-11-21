import { getGitHubIssuesBaseUrl, siteConfig, type SiteConfig } from '../config/siteConfig';
import type { WebsiteSubmissionInput } from '../types/website';

export function buildGitHubSubmissionUrl(
  input: WebsiteSubmissionInput,
  normalizedUrl: string,
  config: SiteConfig = siteConfig
): string {
  const base = getGitHubIssuesBaseUrl(config);
  const params = new URLSearchParams();

  params.set('template', config.githubIssueTemplate);
  if (config.githubIssueLabels.length > 0) {
    params.set('labels', config.githubIssueLabels.join(','));
  }

  const cleanName = input.name.trim();
  params.set('title', `[Website Suggestion]: ${cleanName}`);

  // Prepopulate GitHub Issue Form fields matching IDs in .github/ISSUE_TEMPLATE/website-suggestion.yml
  params.set('website-name', cleanName);
  params.set('website-url', normalizedUrl || input.url.trim());
  params.set('category', input.category.trim());
  params.set('description', input.description.trim());
  params.set('why-useful', input.whyUseful.trim());

  if (input.tags?.trim()) {
    params.set('tags', input.tags.trim());
  }
  if (input.submitterName?.trim()) {
    params.set('submitter-name', input.submitterName.trim());
  }
  if (input.email?.trim()) {
    params.set('contact-email', input.email.trim());
  }

  return `${base}?${params.toString()}`;
}

export function buildPlainTextSubmissionSummary(
  input: WebsiteSubmissionInput,
  normalizedUrl: string
): string {
  const lines = [
    `Website Name: ${input.name.trim()}`,
    `Website URL: ${normalizedUrl || input.url.trim()}`,
    `Category: ${input.category.trim()}`,
    `Short Description: ${input.description.trim()}`,
    `Why it is useful: ${input.whyUseful.trim()}`,
  ];

  if (input.tags?.trim()) {
    lines.push(`Tags: ${input.tags.trim()}`);
  }
  if (input.submitterName?.trim()) {
    lines.push(`Submitted by: ${input.submitterName.trim()}`);
  }
  if (input.email?.trim()) {
    lines.push(`Contact email: ${input.email.trim()}`);
  }

  return lines.join('\n');
}

export function buildEmailFallbackUrl(
  input: WebsiteSubmissionInput,
  normalizedUrl: string,
  config: SiteConfig = siteConfig
): string {
  const subject = encodeURIComponent(`[UsefulHub Suggestion] ${input.name.trim()}`);
  const body = encodeURIComponent(buildPlainTextSubmissionSummary(input, normalizedUrl));
  return `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;
}
