'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Website } from '../types/website';
import { buildSearchSuggestions, type SearchSuggestion } from '../utils/search';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  websites: Website[];
  placeholder?: string;
  size?: 'md' | 'lg';
  enableShortcut?: boolean;
  label?: string;
  showSuggestions?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  websites,
  placeholder = 'Search websites, tools, categories, or tags...',
  size = 'md',
  enableShortcut = false,
  label = 'Search websites',
  showSuggestions = true,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const inputId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(
    () => (showSuggestions ? buildSearchSuggestions(websites, value, 6) : []),
    [websites, value, showSuggestions]
  );

  useEffect(() => {
    if (!enableShortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.label);
    setIsOpen(false);
    setActiveIndex(-1);
    onSubmit?.(suggestion.label);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        onSubmit(value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        setIsOpen(false);
        onSubmit?.(value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const isLarge = size === 'lg';

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative flex items-center">
        <Search
          className={`pointer-events-none absolute left-3.5 text-slate-400 dark:text-slate-500 ${
            isLarge ? 'w-5 h-5 left-4' : 'w-4 h-4'
          }`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showSuggestions && isOpen && suggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 [&::-webkit-search-cancel-button]:hidden ${
            isLarge
              ? 'h-13 pl-12 pr-24 text-base shadow-sm'
              : 'h-11 pl-10 pr-20 text-sm'
          }`}
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {enableShortcut && !value && (
            <kbd
              className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md select-none"
              aria-hidden="true"
            >
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {showSuggestions && isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700/90 bg-white dark:bg-slate-900 shadow-lg py-1.5 overflow-hidden"
        >
          <li className="px-3.5 py-1.5 text-xs text-slate-400 dark:text-slate-500 select-none">
            {value.trim() ? 'Matching suggestions' : 'Popular searches'}
          </li>
          {suggestions.map((item, idx) => (
            <li key={`${item.type}-${item.label}`} role="option" aria-selected={idx === activeIndex}>
              <button
                type="button"
                onClick={() => selectSuggestion(item)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full flex items-center justify-between gap-4 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                  idx === activeIndex
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="font-medium truncate">{item.label}</span>
                {item.sublabel && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {item.sublabel}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
