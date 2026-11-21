import React from 'react';
import {
  Sparkles,
  Code2,
  Palette,
  CheckSquare,
  GraduationCap,
  Briefcase,
  Landmark,
  PenTool,
  BookOpen,
  Wrench,
  Film,
  ShieldCheck,
  GitBranch,
  Atom,
  Gamepad2,
  Compass,
} from 'lucide-react';
import type { CategoryDefinition } from '../types/website';

interface CategoryIconProps {
  icon: CategoryDefinition['icon'];
  className?: string;
}

export function CategoryIcon({ icon, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (icon) {
    case 'Sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'Code2':
      return <Code2 className={className} aria-hidden="true" />;
    case 'Palette':
      return <Palette className={className} aria-hidden="true" />;
    case 'CheckSquare':
      return <CheckSquare className={className} aria-hidden="true" />;
    case 'GraduationCap':
      return <GraduationCap className={className} aria-hidden="true" />;
    case 'Briefcase':
      return <Briefcase className={className} aria-hidden="true" />;
    case 'Landmark':
      return <Landmark className={className} aria-hidden="true" />;
    case 'PenTool':
      return <PenTool className={className} aria-hidden="true" />;
    case 'BookOpen':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'Wrench':
      return <Wrench className={className} aria-hidden="true" />;
    case 'Film':
      return <Film className={className} aria-hidden="true" />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'GitBranch':
      return <GitBranch className={className} aria-hidden="true" />;
    case 'Atom':
      return <Atom className={className} aria-hidden="true" />;
    case 'Gamepad2':
      return <Gamepad2 className={className} aria-hidden="true" />;
    case 'Compass':
    default:
      return <Compass className={className} aria-hidden="true" />;
  }
}
