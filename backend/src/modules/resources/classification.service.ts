import { URL } from 'url';
import { ResourceType } from './resource.service';

export interface UserCategoryInfo {
  _id: string;
  name: string;
  color?: string;
}

export interface ClassificationContext {
  userCategories?: UserCategoryInfo[];
  userExistingTags?: string[];
}

export interface ClassificationResult {
  type: ResourceType;
  typeConfidence: 'high' | 'medium' | 'low';
  suggestedCategory: {
    name: string;
    isExisting: boolean;
    categoryId?: string;
    confidence: 'high' | 'medium' | 'low';
    reason?: string;
  } | null;
  suggestedTags: string[];
}

// Noise words to strip from generated tags
const NOISE_WORDS = new Set([
  'website',
  'home',
  'app',
  'software',
  'online',
  'free',
  'tool',
  'tools',
  'official',
  'download',
  'downloaded',
  'new',
  'best',
  'page',
  'internet',
  'web',
  'service',
  'source',
  'resource',
  'resources',
  'shelfspace',
  'welcome',
  'about',
  'contact',
  'features',
  'pricing',
  'login',
  'signup',
  'dashboard',
  'readme',
  'license',
  'release',
  'releases',
  'code',
  'open',
  'project',
]);

// Synonym normalizations
const TAG_SYNONYMS: Record<string, string> = {
  reactjs: 'react',
  vuejs: 'vue',
  angularjs: 'angular',
  tailwindcss: 'tailwind',
  documentation: 'docs',
  doc: 'docs',
  cheatsheet: 'cheatsheets',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  nodejs: 'nodejs',
  node: 'nodejs',
  golang: 'go',
  uiux: 'ui-ux',
  'ui/ux': 'ui-ux',
  'ui-design': 'ui-ux',
  component: 'components',
  icon: 'icons',
  font: 'fonts',
  auth: 'authentication',
  auth0: 'authentication',
  db: 'database',
  postgres: 'postgresql',
  k8s: 'kubernetes',
};

// Known Developer Technologies Ontology (keyword -> normalized tag)
const TECH_ONTOLOGY: Record<string, string> = {
  react: 'react',
  nextjs: 'nextjs',
  'next.js': 'nextjs',
  vue: 'vue',
  vuejs: 'vue',
  nuxt: 'nuxt',
  nuxtjs: 'nuxt',
  angular: 'angular',
  svelte: 'svelte',
  sveltekit: 'svelte',
  astro: 'astro',
  remix: 'remix',
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  rust: 'rust',
  golang: 'go',
  nodejs: 'nodejs',
  deno: 'deno',
  bun: 'bun',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  css: 'css',
  scss: 'sass',
  sass: 'sass',
  html: 'html',
  graphql: 'graphql',
  rest: 'api',
  api: 'api',
  docker: 'docker',
  kubernetes: 'kubernetes',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  cloudflare: 'cloudflare',
  vercel: 'vercel',
  supabase: 'supabase',
  firebase: 'firebase',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mongodb: 'mongodb',
  redis: 'redis',
  sqlite: 'sqlite',
  prisma: 'prisma',
  drizzle: 'drizzle',
  authentication: 'authentication',
  oauth: 'authentication',
  jwt: 'authentication',
  icons: 'icons',
  lucide: 'icons',
  radix: 'components',
  shadcn: 'components',
  mui: 'components',
  chakra: 'components',
  figma: 'figma',
  dribbble: 'design',
  typography: 'typography',
  fonts: 'fonts',
  vite: 'vite',
  webpack: 'webpack',
  vitest: 'testing',
  jest: 'testing',
  playwright: 'testing',
  cypress: 'testing',
  markdown: 'markdown',
  cli: 'cli',
  llm: 'ai',
  openai: 'ai',
  gemini: 'ai',
  anthropic: 'ai',
  ai: 'ai',
  machinelearning: 'ai',
};

export class ClassificationService {
  /**
   * Comprehensive classification into ResourceType, Category, and 3-5 high-value Tags
   */
  static classify(
    url: string,
    parsed: URL,
    title: string,
    description: string,
    rawKeywords: string[] = [],
    githubData: Record<string, any> | null = null,
    context: ClassificationContext = {}
  ): ClassificationResult {
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const fullText = `${title} ${description} ${host} ${path} ${rawKeywords.join(' ')}`.toLowerCase();

    // 1. Determine Resource Type & Type Confidence
    const { type, typeConfidence, categoryHint } = this.determineResourceType(host, path, fullText, githubData);

    // 2. Generate Intelligent Tags (3–5 tags)
    const suggestedTags = this.generateTags(fullText, host, path, rawKeywords, githubData, context.userExistingTags);

    // 3. Determine Category (Match existing or suggest clean new name)
    const suggestedCategory = this.matchOrSuggestCategory(categoryHint, type, suggestedTags, context.userCategories);

    return {
      type,
      typeConfidence,
      suggestedCategory,
      suggestedTags,
    };
  }

  /**
   * Determine one of the 6 core resource types
   */
  private static determineResourceType(
    host: string,
    path: string,
    fullText: string,
    githubData: Record<string, any> | null
  ): { type: ResourceType; typeConfidence: 'high' | 'medium' | 'low'; categoryHint: string } {
    // 1. Repositories
    if (githubData || (host === 'github.com' && !path.startsWith('/pricing') && !path.startsWith('/features')) || host === 'gitlab.com' || host === 'bitbucket.org' || host === 'codeberg.org') {
      return {
        type: 'repositories',
        typeConfidence: 'high',
        categoryHint: 'Repositories',
      };
    }

    // 2. Code Snippets
    if (
      host === 'gist.github.com' ||
      host.includes('codepen.io') ||
      host.includes('codesandbox.io') ||
      host.includes('jsfiddle.net') ||
      host.includes('replit.com') ||
      host.includes('carbon.now.sh') ||
      host.includes('stackblitz.com') ||
      fullText.includes('code snippet') ||
      fullText.includes('code sample')
    ) {
      return {
        type: 'snippets',
        typeConfidence: host.includes('gist') || host.includes('codepen') ? 'high' : 'medium',
        categoryHint: 'Code Snippets',
      };
    }

    // 3. Components
    if (
      host.includes('shadcn') ||
      host.includes('radix-ui') ||
      host.includes('lucide.dev') ||
      host.includes('heroicons') ||
      host.includes('chakra-ui') ||
      host.includes('mui.com') ||
      host.includes('daisyui') ||
      host.includes('21st.dev') ||
      host.includes('aceternity') ||
      host.includes('magicui') ||
      host.includes('headlessui') ||
      host.includes('mantine') ||
      host.includes('tremor.so') ||
      host.includes('fontawesome') ||
      host.includes('tabler-icons') ||
      fullText.includes('component library') ||
      fullText.includes('ui components') ||
      fullText.includes('react components') ||
      fullText.includes('vue components') ||
      fullText.includes('icon library') ||
      fullText.includes('ui primitives')
    ) {
      return {
        type: 'components',
        typeConfidence: 'high',
        categoryHint: 'UI & Components',
      };
    }

    // 4. Design Resources
    if (
      host.includes('figma.com') ||
      host.includes('dribbble.com') ||
      host.includes('behance.net') ||
      host.includes('coolors.co') ||
      host.includes('fontshare') ||
      host.includes('fonts.google') ||
      host.includes('typewolf') ||
      host.includes('svgrepo') ||
      host.includes('mobbin') ||
      host.includes('lottiefiles') ||
      host.includes('undraw') ||
      fullText.includes('design system') ||
      fullText.includes('color palette') ||
      fullText.includes('typography') ||
      fullText.includes('vector icons') ||
      fullText.includes('ui inspiration')
    ) {
      return {
        type: 'design',
        typeConfidence: 'high',
        categoryHint: 'Design Resources',
      };
    }

    // 5. References / Documentation
    if (
      host.includes('developer.mozilla.org') ||
      host.includes('devdocs.io') ||
      host.includes('w3schools.com') ||
      host.includes('web.dev') ||
      host.includes('caniuse.com') ||
      host.startsWith('docs.') ||
      path.startsWith('/docs') ||
      path.startsWith('/documentation') ||
      path.startsWith('/reference') ||
      path.startsWith('/api-reference') ||
      fullText.includes('api reference') ||
      fullText.includes('documentation') ||
      fullText.includes('cheatsheet') ||
      fullText.includes('developer guide') ||
      fullText.includes('official documentation')
    ) {
      return {
        type: 'references',
        typeConfidence: host.startsWith('docs.') || host.includes('mozilla.org') ? 'high' : 'medium',
        categoryHint: 'Documentation',
      };
    }

    // 6. Tools (Default, SaaS, CLI, Hosting, Platforms)
    return {
      type: 'tools',
      typeConfidence: fullText.includes('cli') || fullText.includes('tool') || fullText.includes('platform') || fullText.includes('bundler') ? 'medium' : 'low',
      categoryHint: 'Developer Tools',
    };
  }

  /**
   * Match against user's existing categories or recommend a standardized new category name
   */
  private static matchOrSuggestCategory(
    categoryHint: string,
    type: ResourceType,
    tags: string[],
    userCategories: UserCategoryInfo[] = []
  ): {
    name: string;
    isExisting: boolean;
    categoryId?: string;
    confidence: 'high' | 'medium' | 'low';
    reason?: string;
  } {
    // A. Check against user's existing categories
    if (userCategories.length > 0) {
      let bestMatch: UserCategoryInfo | null = null;
      let highestScore = 0;

      for (const cat of userCategories) {
        const catLower = cat.name.toLowerCase().trim();
        let score = 0;

        // Exact match with category hint or type
        if (catLower === categoryHint.toLowerCase()) score += 10;
        if (catLower.includes(type)) score += 6;
        if (type === 'tools' && (catLower.includes('tool') || catLower.includes('utilities'))) score += 7;
        if (type === 'repositories' && (catLower.includes('repo') || catLower.includes('codebase') || catLower.includes('open source'))) score += 8;
        if (type === 'components' && (catLower.includes('component') || catLower.includes('ui') || catLower.includes('frontend'))) score += 8;
        if (type === 'design' && (catLower.includes('design') || catLower.includes('asset') || catLower.includes('color') || catLower.includes('typography'))) score += 8;
        if (type === 'references' && (catLower.includes('doc') || catLower.includes('reference') || catLower.includes('guide') || catLower.includes('learning'))) score += 8;
        if (type === 'snippets' && (catLower.includes('snippet') || catLower.includes('script'))) score += 8;

        // Tag overlap with category name
        for (const tag of tags) {
          if (catLower.includes(tag) || tag.includes(catLower)) {
            score += 4;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = cat;
        }
      }

      // If confidence score is strong enough, recommend existing category
      if (bestMatch && highestScore >= 6) {
        return {
          name: bestMatch.name,
          isExisting: true,
          categoryId: bestMatch._id,
          confidence: highestScore >= 10 ? 'high' : 'medium',
          reason: `Matches your existing category "${bestMatch.name}"`,
        };
      }
    }

    // B. Suggest a clean, standardized new category name based on content & tags
    let suggestedName = categoryHint;
    if (tags.includes('ai')) suggestedName = 'AI & Machine Learning';
    else if (tags.includes('docker') || tags.includes('kubernetes') || tags.includes('aws') || tags.includes('cloudflare')) suggestedName = 'DevOps & Cloud';
    else if (tags.includes('api') && type === 'tools') suggestedName = 'APIs & Backend';
    else if (tags.includes('icons')) suggestedName = 'Icons & Assets';
    else if (tags.includes('testing')) suggestedName = 'Testing & Quality';

    return {
      name: suggestedName,
      isExisting: false,
      confidence: 'medium',
      reason: `Suggested new category for ${type}`,
    };
  }

  /**
   * Generates 3–5 relevant, deduplicated, and meaningful tags
   */
  private static generateTags(
    fullText: string,
    host: string,
    path: string,
    rawKeywords: string[],
    githubData: Record<string, any> | null,
    userExistingTags: string[] = []
  ): string[] {
    const candidateTags: Map<string, number> = new Map(); // tag -> weight score

    const addCandidate = (rawTag: string, weight: number) => {
      if (!rawTag) return;
      let clean = rawTag.toLowerCase().trim().replace(/^#+/, '').replace(/[^a-z0-9_-]/g, '');
      if (clean.length < 2 || clean.length > 25) return;
      if (NOISE_WORDS.has(clean)) return;

      // Apply synonym mapping
      if (TAG_SYNONYMS[clean]) {
        clean = TAG_SYNONYMS[clean];
      }

      // Extra bonus if the user already uses this exact tag in their library!
      if (userExistingTags && userExistingTags.includes(clean)) {
        weight += 3;
      }

      candidateTags.set(clean, (candidateTags.get(clean) || 0) + weight);
    };

    // 1. From GitHub metadata (Highest priority)
    if (githubData) {
      if (githubData.language) {
        addCandidate(githubData.language, 6);
      }
      if (githubData.topics && Array.isArray(githubData.topics)) {
        for (const topic of githubData.topics) {
          addCandidate(topic, 5);
        }
      }
    }

    // 2. From Tech Ontology matches in text (High priority)
    for (const [kw, normTag] of Object.entries(TECH_ONTOLOGY)) {
      // Word boundary regex check
      const regex = new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(fullText)) {
        addCandidate(normTag, 4);
      }
    }

    // 3. From HTML Meta Keywords (Medium priority)
    for (const kw of rawKeywords) {
      addCandidate(kw, 3);
    }

    // 4. Domain & Path heuristics
    if (host.includes('github.com')) addCandidate('github', 2);
    if (host.includes('figma.com')) addCandidate('figma', 4);
    if (host.includes('shadcn') || host.includes('radix')) addCandidate('ui', 3);
    if (path.includes('/api')) addCandidate('api', 3);
    if (path.includes('/docs')) addCandidate('docs', 3);

    // 5. Rank and pick top 3–5 unique tags
    const sorted = Array.from(candidateTags.entries())
      .sort((a, b) => b[1] - a[1]) // Sort descending by score
      .map(([tag]) => tag);

    // Remove synonymous combinations (e.g. if 'react' exists, drop 'reactjs')
    const finalTags: string[] = [];
    for (const tag of sorted) {
      if (!finalTags.includes(tag)) {
        finalTags.push(tag);
      }
      if (finalTags.length >= 5) break;
    }

    // Fallback if less than 3 tags found: add general purposeful tag
    if (finalTags.length < 3) {
      if (fullText.includes('frontend') && !finalTags.includes('frontend')) finalTags.push('frontend');
      if (fullText.includes('backend') && !finalTags.includes('backend')) finalTags.push('backend');
      if (fullText.includes('database') && !finalTags.includes('database')) finalTags.push('database');
      if (fullText.includes('security') && !finalTags.includes('security')) finalTags.push('security');
      if (fullText.includes('developer') && !finalTags.includes('developer-tools')) finalTags.push('developer-tools');
    }

    return finalTags.slice(0, 5);
  }
}
