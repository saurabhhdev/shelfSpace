import React from 'react';
import { Flaticon } from '../components/ui/Flaticon';
import type { ResourceType } from '../types';

export interface ResourceTypeConfig {
  id: ResourceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const createFlaticonComponent = (name: string): React.FC<{ className?: string }> => {
  return ({ className }) => React.createElement(Flaticon, { name, className });
};

export const RESOURCE_TYPES: ResourceTypeConfig[] = [
  { id: 'tools', label: 'Tools', icon: createFlaticonComponent('tools') },
  { id: 'repositories', label: 'Repositories', icon: createFlaticonComponent('code-branch') },
  { id: 'components', label: 'Components', icon: createFlaticonComponent('layers') },
  { id: 'snippets', label: 'Code Snippets', icon: createFlaticonComponent('file-code') },
  { id: 'design', label: 'Design Resources', icon: createFlaticonComponent('palette') },
  { id: 'references', label: 'References', icon: createFlaticonComponent('book-alt') },
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
  return found ? found.icon : RESOURCE_TYPES[0].icon;
};
