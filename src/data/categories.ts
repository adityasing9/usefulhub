import type { CategoryDefinition, CategoryName } from '../types/website';

export const CATEGORIES: CategoryDefinition[] = [
  {
    name: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Practical AI assistants, research models, and machine learning workspaces.',
    icon: 'Sparkles',
  },
  {
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'Code hosting, documentation, sandboxes, and engineering utilities.',
    icon: 'Code2',
  },
  {
    name: 'Design & Creativity',
    slug: 'design-creativity',
    description: 'Interface design, illustration, photo editing, and diagramming tools.',
    icon: 'Palette',
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    description: 'Note-taking, cloud storage, project organization, and daily workflow apps.',
    icon: 'CheckSquare',
  },
  {
    name: 'Education & Learning',
    slug: 'education-learning',
    description: 'Free courses, interactive curricula, and structured learning platforms.',
    icon: 'GraduationCap',
  },
  {
    name: 'Business & Marketing',
    slug: 'business-marketing',
    description: 'Analytics, market research, customer communication, and operations tools.',
    icon: 'Briefcase',
  },
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Financial literacy, market reference, budgeting, and calculator utilities.',
    icon: 'Landmark',
  },
  {
    name: 'Writing & Content',
    slug: 'writing-content',
    description: 'Editing, readability analysis, publishing, and language reference tools.',
    icon: 'PenTool',
  },
  {
    name: 'Research',
    slug: 'research',
    description: 'Academic search engines, citation databases, and scholarly archives.',
    icon: 'BookOpen',
  },
  {
    name: 'Utilities',
    slug: 'utilities',
    description: 'Fast single-purpose web utilities for files, media, and web archives.',
    icon: 'Wrench',
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Curated listening, film discovery, and cultural exploration across the web.',
    icon: 'Film',
  },
  {
    name: 'Security & Privacy',
    slug: 'security-privacy',
    description: 'Threat scanning, breach lookup, password management, and privacy guides.',
    icon: 'ShieldCheck',
  },
  {
    name: 'Open Source',
    slug: 'open-source',
    description: 'Community-maintained open-source software directories and free ecosystems.',
    icon: 'GitBranch',
  },
  {
    name: 'Science',
    slug: 'science',
    description: 'Open scientific data, astronomy portals, and interactive science references.',
    icon: 'Atom',
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Indie game hubs, chess platforms, and thoughtful web-based games.',
    icon: 'Gamepad2',
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Unique, genuinely useful internet gems that span multiple disciplines.',
    icon: 'Compass',
  },
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getCategorySlug(name: CategoryName | string): string {
  const found = getCategoryByName(name);
  if (found) return found.slug;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
