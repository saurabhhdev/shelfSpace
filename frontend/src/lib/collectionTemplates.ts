export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  suggestedCategories: string[];
  suggestedTags: string[];
  iconName?: string;
}

export interface CategorySuggestion {
  name: string;
  color: string;
  description?: string;
}

/**
 * 12 Curated Pre-made Collection Templates for Developers
 */
export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    id: 'frontend-development',
    name: 'Frontend Development',
    description: 'Modern frontend frameworks, styling systems, component libraries, and browser tools.',
    color: '#3b82f6',
    suggestedCategories: ['Frontend', 'UI Components', 'Design', 'Tutorials'],
    suggestedTags: ['react', 'vue', 'tailwind', 'typescript', 'nextjs', 'css', 'state-management'],
    iconName: 'layout-fluid',
  },
  {
    id: 'backend-development',
    name: 'Backend Development',
    description: 'Server-side frameworks, databases, API architectures, and microservice infrastructure.',
    color: '#10b981',
    suggestedCategories: ['Backend', 'Database', 'APIs', 'Testing'],
    suggestedTags: ['nodejs', 'express', 'fastapi', 'golang', 'graphql', 'sql', 'redis', 'auth'],
    iconName: 'server',
  },
  {
    id: 'full-stack-development',
    name: 'Full Stack Development',
    description: 'End-to-end boilerplates, full-stack frameworks, database ORMs, and deployment tools.',
    color: '#8b5cf6',
    suggestedCategories: ['Frontend', 'Backend', 'APIs', 'Database'],
    suggestedTags: ['fullstack', 'nextjs', 'prisma', 'trpc', 'monorepo', 'docker', 'saas'],
    iconName: 'layers',
  },
  {
    id: 'ui-ux-inspiration',
    name: 'UI/UX Inspiration',
    description: 'Design systems, landing page inspiration, icon sets, micro-interactions, and palettes.',
    color: '#ec4899',
    suggestedCategories: ['Design', 'UI Components', 'Tutorials'],
    suggestedTags: ['design-system', 'inspiration', 'typography', 'palette', 'motion', 'icons'],
    iconName: 'eye',
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Terminal utilities, productivity CLIs, debuggers, code linters, and editor extensions.',
    color: '#D97757',
    suggestedCategories: ['DevTools', 'Documentation', 'Testing'],
    suggestedTags: ['cli', 'terminal', 'debugger', 'git', 'extension', 'formatter', 'linter'],
    iconName: 'settings-sliders',
  },
  {
    id: 'github-repositories',
    name: 'GitHub Repositories',
    description: 'Star-worthy open source codebases, reference architectures, and starter templates.',
    color: '#FAF9F5',
    suggestedCategories: ['DevTools', 'Documentation', 'APIs'],
    suggestedTags: ['open-source', 'github', 'showcase', 'boilerplate', 'template', 'stars'],
    iconName: 'box',
  },
  {
    id: 'ai-machine-learning',
    name: 'AI & Machine Learning',
    description: 'LLM toolkits, prompt collections, embeddings, model providers, and vector databases.',
    color: '#06b6d4',
    suggestedCategories: ['AI Tools', 'APIs', 'Documentation'],
    suggestedTags: ['ai', 'llm', 'langchain', 'prompting', 'openai', 'embeddings', 'rag', 'agents'],
    iconName: 'sparkles',
  },
  {
    id: 'learning-resources',
    name: 'Learning Resources',
    description: 'Developer guides, interactive tutorials, roadmaps, cheatsheets, and book references.',
    color: '#f59e0b',
    suggestedCategories: ['Tutorials', 'Documentation'],
    suggestedTags: ['learn', 'cheatsheet', 'roadmap', 'guides', 'algorithms', 'interview', 'books'],
    iconName: 'book-alt',
  },
  {
    id: 'open-source-projects',
    name: 'Open Source Projects',
    description: 'Community projects, self-hosted applications, and repositories welcoming contributions.',
    color: '#6366f1',
    suggestedCategories: ['DevTools', 'APIs', 'Documentation'],
    suggestedTags: ['oss', 'self-hosted', 'community', 'contribute', 'showcase', 'mit-license'],
    iconName: 'globe',
  },
  {
    id: 'deployment-hosting',
    name: 'Deployment & Hosting',
    description: 'Cloud infrastructure, containerization, serverless runtimes, and CI/CD pipelines.',
    color: '#14b8a6',
    suggestedCategories: ['Hosting', 'DevTools', 'Testing'],
    suggestedTags: ['docker', 'serverless', 'cloudflare', 'aws', 'cicd', 'kubernetes', 'vercel'],
    iconName: 'cloud-upload',
  },
  {
    id: 'productivity-tools',
    name: 'Productivity Tools',
    description: 'Note-taking apps, task automation, markdown editors, and workflow optimizers.',
    color: '#84cc16',
    suggestedCategories: ['DevTools', 'Documentation'],
    suggestedTags: ['productivity', 'workflow', 'notes', 'markdown', 'automation', 'efficiency'],
    iconName: 'check',
  },
  {
    id: 'design-resources',
    name: 'Design Resources',
    description: 'High-quality vector graphics, SVG icons, 3D assets, fonts, and mockup generators.',
    color: '#f43f5e',
    suggestedCategories: ['Design', 'UI Components'],
    suggestedTags: ['icons', 'fonts', 'svg', 'illustrations', 'mockup', '3d', 'assets'],
    iconName: 'paint-brush',
  },
];

/**
 * 12 Pre-made Category Suggestions
 */
export const CATEGORY_SUGGESTIONS: CategorySuggestion[] = [
  { name: 'Frontend', color: '#3b82f6', description: 'Frameworks, CSS, UI kits & web apps' },
  { name: 'Backend', color: '#10b981', description: 'APIs, server runtimes, services & auth' },
  { name: 'Database', color: '#6366f1', description: 'SQL, NoSQL, ORMs & storage engines' },
  { name: 'UI Components', color: '#8b5cf6', description: 'Accessible widgets, primitives & controls' },
  { name: 'Design', color: '#ec4899', description: 'Visual systems, inspiration & typography' },
  { name: 'APIs', color: '#06b6d4', description: 'Public interfaces, SDKs & GraphQL endpoints' },
  { name: 'Documentation', color: '#71717a', description: 'Official specs, cheatsheets & references' },
  { name: 'Tutorials', color: '#f59e0b', description: 'Step-by-step guides, courses & walk-throughs' },
  { name: 'DevTools', color: '#D97757', description: 'CLIs, linters, debuggers & extensions' },
  { name: 'Hosting', color: '#14b8a6', description: 'Cloud providers, containers & serverless' },
  { name: 'Testing', color: '#84cc16', description: 'Unit testing, E2E suites & benchmarks' },
  { name: 'AI Tools', color: '#f43f5e', description: 'LLMs, vector models, prompt engines & bots' },
];
