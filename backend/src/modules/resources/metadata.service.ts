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
  type?: ResourceType;
  metadata?: Record<string, any>;
}

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
   * Safe URL metadata extraction using SSRF verification, timeouts, and size limits
   */
  static async extract(rawUrl: string): Promise<ExtractedMetadata> {
    const normalized = normalizeUrl(rawUrl);
    const parsed = new URL(normalized);

    const defaultTitle = parsed.hostname.replace(/^www\./, '');
    const fallback: ExtractedMetadata = {
      title: defaultTitle,
      description: '',
      previewImage: '',
      favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
      type: 'development',
      metadata: {},
    };

    // Check if it's a GitHub repo: github.com/:owner/:repo
    const ghMatch = parsed.hostname === 'github.com' && parsed.pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
    if (ghMatch) {
      const owner = ghMatch[1];
      const repo = ghMatch[2].replace(/\.git$/, '');
      if (owner && repo && owner !== 'settings' && owner !== 'explore') {
        const ghData = await this.fetchGitHubRepo(owner, repo);
        if (ghData) {
          return {
            title: `${owner}/${repo}`,
            description: ghData.topics?.length ? `GitHub repository: ${ghData.topics.join(', ')}` : `GitHub repository by ${owner}`,
            previewImage: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
            favicon: 'https://github.githubassets.com/favicons/favicon.png',
            type: 'development',
            metadata: ghData,
          };
        }
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
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(normalized, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Shelfspace/1.0',
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
      const title = (ogTitle || twitterTitle || metaTitle || defaultTitle).trim();

      // Extract Description
      const ogDesc = $('meta[property="og:description"]').attr('content');
      const twitterDesc = $('meta[name="twitter:description"]').attr('content');
      const metaDesc = $('meta[name="description"]').attr('content');
      const description = (ogDesc || twitterDesc || metaDesc || '').trim();

      // Extract Image
      let previewImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';
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

      // Infer resource type from URL/content heuristics
      let inferredType: ResourceType = 'development';
      const host = parsed.hostname.toLowerCase();
      if (host.includes('dribbble') || host.includes('behance') || host.includes('coolors') || host.includes('font') || host.includes('palette')) {
        inferredType = 'design';
      } else if (host.includes('21st.dev') || host.includes('ui') || host.includes('component') || host.includes('tailwind') || host.includes('shadcn') || host.includes('lineicons') || host.includes('lucide') || host.includes('icons')) {
        inferredType = 'ui';
      } else if (host.includes('docs') || host.includes('tutorial') || host.includes('learn') || host.includes('medium') || host.includes('dev.to') || host.includes('hashnode')) {
        inferredType = 'learning';
      } else if (host.includes('api') || host.includes('rapidapi') || host.includes('postman') || host.includes('kaggle') || host.includes('dataset')) {
        inferredType = 'data';
      }

      return {
        title,
        description,
        previewImage,
        favicon,
        type: inferredType,
        metadata: {},
      };
    } catch (err) {
      logger.debug(`Extraction fallback for ${normalized}`, { error: err });
      return fallback;
    }
  }
}
