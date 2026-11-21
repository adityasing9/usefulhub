import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CategoryDefinition } from '../types/website';
import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: CategoryDefinition;
  count: number;
}

export function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/15 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <CategoryIcon icon={category.icon} className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {count} {count === 1 ? 'site' : 'sites'}
          </span>
        </div>

        <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {category.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <span>Browse category</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
