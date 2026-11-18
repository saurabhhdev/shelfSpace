export interface PreMadeCollection {
  name: string;
  color: string;
  iconName: string;
}

/**
 * 10 Ready-to-use Simple Collection Suggestions
 */
export const PRE_MADE_COLLECTIONS: PreMadeCollection[] = [
  { name: 'Frontend', color: '#3b82f6', iconName: 'layout-fluid' },
  { name: 'Backend', color: '#10b981', iconName: 'server' },
  { name: 'Full Stack', color: '#8b5cf6', iconName: 'layers' },
  { name: 'UI Components', color: '#ec4899', iconName: 'paint-brush' },
  { name: 'Developer Tools', color: '#D97757', iconName: 'settings-sliders' },
  { name: 'AI & ML', color: '#06b6d4', iconName: 'sparkles' },
  { name: 'Learning Resources', color: '#f59e0b', iconName: 'book-alt' },
  { name: 'Design Inspiration', color: '#f43f5e', iconName: 'eye' },
  { name: 'GitHub Repositories', color: '#FAF9F5', iconName: 'box' },
  { name: 'DevOps & Deployment', color: '#14b8a6', iconName: 'cloud-upload' },
];
