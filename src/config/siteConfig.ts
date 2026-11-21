import { CATEGORIES } from '../data/categories';

export interface SiteConfig {
  siteName: string;
  tagline: string;
  siteDescription: string;
  siteUrl: string;
  githubOwner: string;
  githubRepo: string;
  githubIssueTemplate: string;
  githubIssueLabels: string[];
  /**
   * Optional Google Forms URL for visitors without a GitHub account.
   * Leave empty ("") if you only want GitHub Issue submissions.
   */
  googleFormsUrl: string;
  contactEmail: string;
  socialLinks: {
    github: string;
    x?: string;
  };
  itemsPerPage: number;
  categories: typeof CATEGORIES;
}

const resolvedSiteUrl =
  (typeof process !== 'undefined' && process.env.APP_URL) ||
  'https://usefulhub.org';

export const siteConfig: SiteConfig = {
  siteName: 'UsefulHub',
  tagline: 'Discover websites worth bookmarking.',
  siteDescription:
    'A community-curated directory of genuinely useful websites, practical tools, and online resources reviewed by humans.',
  siteUrl: resolvedSiteUrl.replace(/\/$/, ''),
  githubOwner: 'adityasing9',
  githubRepo: 'usefulhub',
  githubIssueTemplate: 'website-suggestion.yml',
  githubIssueLabels: ['website-suggestion', 'pending-review'],
  googleFormsUrl: '',
  contactEmail: 'hello@usefulhub.org',
  socialLinks: {
    github: 'https://github.com/adityasing9/usefulhub',
  },
  itemsPerPage: 12,
  categories: CATEGORIES,
};

export function getGitHubIssuesBaseUrl(config: SiteConfig = siteConfig): string {
  return `https://github.com/${encodeURIComponent(config.githubOwner)}/${encodeURIComponent(config.githubRepo)}/issues/new`;
}

export function isGitHubConfigured(config: SiteConfig = siteConfig): boolean {
  return (
    Boolean(config.githubOwner) &&
    Boolean(config.githubRepo) &&
    config.githubOwner !== 'YOUR_GITHUB_USERNAME' &&
    config.githubRepo !== 'YOUR_REPOSITORY_NAME'
  );
}
