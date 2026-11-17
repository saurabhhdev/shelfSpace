import * as cheerio from 'cheerio';
import { URL } from 'url';
import { validateSafeUrl } from '../../utils/ssrf';
import { ResourceType } from './resource.model';
import { logger } from '../../utils/logger';

export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    const parsed = new URL(clean);
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();

    // Strip common tracking and analytics query parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'msclkid',
      'ref',
      'source',
      'mc_cid',
      'mc_eid',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Strip hash
    parsed.hash = '';

    // Strip trailing slash if path is longer than /
    let result = parsed.toString();
    if (result.endsWith('/') && parsed.pathname !== '/') {
      result = result.slice(0, -1);
    }
    return result;
  } catch (e) {
    return rawUrl.trim();
  }
}

export interface ExtractedMetadata {
  title: string;
  description: string;
  previewImage?: string;
  favicon?: string;
  type: ResourceType;
  domain: string;
  siteName?: string;
  suggestedTags: string[];
  suggestedCategory?: string;
  confidence: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

const COMMON_TECH_KEYWORDS = [
  'react',
  'vue',
  'angular',
  'svelte',
  'nextjs',
  'astro',
  'remix',
  'typescript',
  'javascript',
  'python',
  'rust',
  'golang',
  'node',
  'deno',
  'bun',
  'tailwind',
  'css',
  'html',
  'graphql',
  'rest',
  'api',
  'docker',
  'kubernetes',
  'aws',
  'gcp',
  'database',
  'postgres',
  'mongodb',
  'redis',
  'prisma',
  'supabase',
  'firebase',
  'auth',
  'icons',
  'ui',
  'design',
  'cli',
  'ai',
  'llm',
  'vite',
  'testing',
  'security',
];

export class MetadataService {
  /**
   * Fetches public GitHub metadata if the URL matches a GitHub repository
   */
  static async fetchGitHubRepo(owner: string, repo: string): Promise<Record<string, any> | null> {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Shelfspace-Developer-Workspace',
          Accept: 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data: any = await res.json();

      return {
        repository: `${owner}/${repo}`,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        license: data.license?.spdx_id || data.license?.name || undefined,
        openIssues: data.open_issues_count,
        defaultBranch: data.default_branch,
        topics: data.topics || [],
      };
    } catch (err) {
      logger.debug('GitHub API lookup failed gracefully', { error: err });
      return null;
    }
  }

  /**
   * Intelligent Classification into the 6 Core Resource Types
   */
  static classify(
    url: string,
    parsed: URL,
    title: string,
    description: string
  ): {
    type: ResourceType;
    confidence: 'high' | 'medium' | 'low';
    suggestedCategory?: string;
    suggestedTags: string[];
  } {
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const fullText = `${title} ${description} ${host} ${path}`.toLowerCase();

    // 1. Repositories
    if (
      (host === 'github.com' && !path.startsWith('/pricing') && !path.startsWith('/features')) ||
      host === 'gitlab.com' ||
      host === 'bitbucket.org' ||
      host === 'codeberg.org'
    ) {
      return {
        type: 'repositories',
        confidence: 'high',
        suggestedCategory: 'Repositories',
        suggestedTags: this.extractTechTags(fullText),
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
        confidence: host.includes('gist') || host.includes('codepen') ? 'high' : 'medium',
        suggestedCategory: 'Snippets',
        suggestedTags: this.extractTechTags(fullText),
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
      fullText.includes('component library') ||
      fullText.includes('ui components') ||
      fullText.includes('react components') ||
      fullText.includes('icon library')
    ) {
      return {
        type: 'components',
        confidence: 'high',
        suggestedCategory: 'Components',
        suggestedTags: this.extractTechTags(fullText, ['ui', 'components']),
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
      fullText.includes('design system') ||
      fullText.includes('color palette') ||
      fullText.includes('typography') ||
      fullText.includes('vector icons')
    ) {
      return {
        type: 'design',
        confidence: 'high',
        suggestedCategory: 'Design Resources',
        suggestedTags: this.extractTechTags(fullText, ['design']),
      };
    }

    // 5. References / Documentation
    if (
      host.includes('developer.mozilla.org') ||
      host.includes('devdocs.io') ||
      host.startsWith('docs.') ||
      path.startsWith('/docs') ||
      path.startsWith('/documentation') ||
      path.startsWith('/reference') ||
      path.startsWith('/api') ||
      fullText.includes('api reference') ||
      fullText.includes('documentation') ||
      fullText.includes('cheatsheet') ||
      fullText.includes('developer guide')
    ) {
      return {
        type: 'references',
        confidence: host.startsWith('docs.') || host.includes('mozilla.org') ? 'high' : 'medium',
        suggestedCategory: 'Documentation',
        suggestedTags: this.extractTechTags(fullText, ['docs']),
      };
    }

    // 6. Tools (Default / SaaS / CLI / Utilities)
    return {
      type: 'tools',
      confidence: fullText.includes('tool') || fullText.includes('cli') || fullText.includes('platform') ? 'medium' : 'low',
      suggestedCategory: 'Developer Tools',
      suggestedTags: this.extractTechTags(fullText, ['tools']),
    };
  }

  private static extractTechTags(text: string, baseTags: string[] = []): string[] {
    const found = new Set<string>(baseTags);
    for (const kw of COMMON_TECH_KEYWORDS) {
      if (text.includes(kw)) {
        found.add(kw);
      }
      if (found.size >= 5) break;
    }
    return Array.from(found);
  }

  /**
   * Safe URL metadata extraction using SSRF verification, timeouts, and size limits
   */
  static async extract(rawUrl: string): Promise<ExtractedMetadata> {
    const normalized = normalizeUrl(rawUrl);
    const parsed = new URL(normalized);
    const domain = parsed.hostname.replace(/^www\./, '');

    const fallback: ExtractedMetadata = {
      title: domain,
      description: '',
      previewImage: '',
      favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
      type: 'tools',
      domain,
      siteName: domain,
      suggestedTags: [],
      suggestedCategory: 'Developer Tools',
      confidence: 'low',
      metadata: {},
    };

    // Check if it's a GitHub repo: github.com/:owner/:repo
    const ghMatch = parsed.hostname === 'github.com' && parsed.pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
    if (ghMatch) {
      const owner = ghMatch[1];
      const repo = ghMatch[2].replace(/\.git$/, '');
      if (owner && repo && owner !== 'settings' && owner !== 'explore' && owner !== 'topics') {
        const ghData = await this.fetchGitHubRepo(owner, repo);
        const tags = Array.from(
          new Set(
            [ghData?.language?.toLowerCase(), ...(ghData?.topics || [])].filter(Boolean)
          )
        ).slice(0, 5);

        return {
          title: `${owner}/${repo}`,
          description: ghData?.description || (ghData?.topics?.length ? `GitHub repository: ${ghData.topics.join(', ')}` : `GitHub repository by ${owner}`),
          previewImage: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
          favicon: 'https://github.githubassets.com/favicons/favicon.png',
          type: 'repositories',
          domain: 'github.com',
          siteName: 'GitHub',
          suggestedTags: tags,
          suggestedCategory: 'Repositories',
          confidence: 'high',
          metadata: ghData || {},
        };
      }
    }

    // SSRF verification
    const safeCheck = await validateSafeUrl(normalized);
    if (!safeCheck.safe) {
      logger.warn(`SSRF Block for URL ${normalized}: ${safeCheck.reason}`);
      return fallback;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(normalized, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Shelfspace/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return fallback;
      }

      // Read response with 2MB size cap
      const reader = response.body?.getReader();
      let html = '';
      let receivedBytes = 0;
      const MAX_BYTES = 2 * 1024 * 1024; // 2MB

      if (reader) {
        const decoder = new TextDecoder('utf-8');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          receivedBytes += value.length;
          html += decoder.decode(value, { stream: true });
          if (receivedBytes > MAX_BYTES) {
            reader.cancel();
            break;
          }
        }
      } else {
        html = await response.text();
      }

      const $ = cheerio.load(html);

      // Extract Title
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const twitterTitle = $('meta[name="twitter:title"]').attr('content');
      const metaTitle = $('title').text().trim();
      const title = (ogTitle || twitterTitle || metaTitle || domain).trim();

      // Extract Description
      const ogDesc = $('meta[property="og:description"]').attr('content');
      const twitterDesc = $('meta[name="twitter:description"]').attr('content');
      const metaDesc = $('meta[name="description"]').attr('content');
      const description = (ogDesc || twitterDesc || metaDesc || '').trim();

      // Extract Site Name
      const siteName =
        $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="application-name"]').attr('content') ||
        domain;

      // Extract Image
      let previewImage =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[name="twitter:image:src"]').attr('content') ||
        '';
      if (previewImage) {
        try {
          previewImage = new URL(previewImage, normalized).toString();
        } catch {
          previewImage = '';
        }
      }

      // Extract Favicon
      let favicon =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        '';
      if (favicon) {
        try {
          favicon = new URL(favicon, normalized).toString();
        } catch {
          favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
        }
      } else {
        favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
      }

      // Extract Meta Keywords
      const rawKeywords = $('meta[name="keywords"]').attr('content') || '';
      const metaTags = rawKeywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 1 && k.length < 25)
        .slice(0, 4);

      // Classify resource
      const classification = this.classify(normalized, parsed, title, description);
      const combinedTags = Array.from(
        new Set([...classification.suggestedTags, ...metaTags])
      ).slice(0, 5);

      return {
        title,
        description,
        previewImage,
        favicon,
        type: classification.type,
        domain,
        siteName,
        suggestedTags: combinedTags,
        suggestedCategory: classification.suggestedCategory,
        confidence: classification.confidence,
        metadata: {},
      };
    } catch (err) {
      logger.debug(`Extraction fallback for ${normalized}`, { error: err });
      return fallback;
    }
  }
}
