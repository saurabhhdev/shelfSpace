import React from 'react';
import {
  Wrench,
  GitBranch,
  Layers,
  Code2,
  Palette,
  BookOpen,
} from 'lucide-react';
import type { ResourceType } from '../types';

export interface ResourceTypeConfig {
  id: ResourceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const RESOURCE_TYPES: ResourceTypeConfig[] = [
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'repositories', label: 'Repositories', icon: GitBranch },
  { id: 'components', label: 'Components', icon: Layers },
  { id: 'snippets', label: 'Code Snippets', icon: Code2 },
  { id: 'design', label: 'Design Resources', icon: Palette },
  { id: 'references', label: 'References', icon: BookOpen },
];

export const normalizeResourceType = (type: string): ResourceType => {
  switch (type) {
    case 'tools':
      return 'tools';
    case 'repositories':
    case 'development':
      return 'repositories';
    case 'components':
    case 'ui':
      return 'components';
    case 'snippets':
    case 'personal':
      return 'snippets';
    case 'design':
      return 'design';
    case 'references':
    case 'data':
    case 'learning':
      return 'references';
    default:
      return 'tools';
  }
};

export const getResourceTypeLabel = (type: string): string => {
  const normalized = normalizeResourceType(type);
  const found = RESOURCE_TYPES.find((t) => t.id === normalized);
  return found ? found.label : 'Resource';
};

export const getResourceTypeIcon = (type: string) => {
  const normalized = normalizeResourceType(type);
  const found = RESOURCE_TYPES.find((t) => t.id === normalized);
  return found ? found.icon : Wrench;
};
