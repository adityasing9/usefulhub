export type PricingModel = 'Free' | 'Freemium' | 'Paid' | 'Open Source';

export type CategoryName =
  | 'AI & Machine Learning'
  | 'Developer Tools'
  | 'Design & Creativity'
  | 'Productivity'
  | 'Education & Learning'
  | 'Business & Marketing'
  | 'Finance'
  | 'Writing & Content'
  | 'Research'
  | 'Utilities'
  | 'Entertainment'
  | 'Security & Privacy'
  | 'Open Source'
  | 'Science'
  | 'Gaming'
  | 'Other';

export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  category: CategoryName | string;
  tags: string[];
  favicon?: string;
  featured: boolean;
  dateAdded: string; // YYYY-MM-DD
  approved: boolean;
  pricing?: PricingModel;
  likes?: number;
}

export interface CategoryDefinition {
  name: CategoryName;
  slug: string;
  description: string;
  icon:
    | 'Sparkles'
    | 'Code2'
    | 'Palette'
    | 'CheckSquare'
    | 'GraduationCap'
    | 'Briefcase'
    | 'Landmark'
    | 'PenTool'
    | 'BookOpen'
    | 'Wrench'
    | 'Film'
    | 'ShieldCheck'
    | 'GitBranch'
    | 'Atom'
    | 'Gamepad2'
    | 'Compass';
}

export type SortOption = 'liked' | 'name' | 'recent' | 'featured' | 'alphabetical';

export interface WebsiteSubmissionInput {
  name: string;
  url: string;
  category: string;
  description: string;
  whyUseful: string;
  submitterName?: string;
  email?: string;
  tags?: string;
}

export interface SubmissionValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof WebsiteSubmissionInput, string>>;
  warnings: string[];
  duplicateMatch: Website | null;
  normalizedUrl: string;
}

export interface JsonImportResult {
  valid: boolean;
  sites: Website[];
  errors: string[];
  warnings: string[];
}
