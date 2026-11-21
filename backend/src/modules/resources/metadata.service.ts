import * as cheerio from 'cheerio';
import { URL } from 'url';
import { validateSafeUrl } from '../../utils/ssrf';
import { ResourceType } from './resource.service';
import { logger } from '../../utils/logger';
import { ClassificationService, ClassificationContext } from './classification.service';

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
  typeConfidence: 'high' | 'medium' | 'low';
  domain: string;
  siteName?: string;
  suggestedTags: string[];
  suggestedCategory: {
    name: string;
    isExisting: boolean;
    categoryId?: string;
    confidence: 'high' | 'medium' | 'low';
    reason?: string;
  } | null;
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
        description: data.description,
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
   * Safe URL metadata extraction using SSRF verification, timeouts, size limits,
   * coupled with deterministic classification and auto tag generation.
   */
  static async extract(rawUrl: string, context: ClassificationContext = {}): Promise<ExtractedMetadata> {
    const normalized = normalizeUrl(rawUrl);
    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      const trimmed = (rawUrl || '').trim();
      return {
        title: trimmed || 'Untitled Resource',
        description: '',
        previewImage: '',
        favicon: '',
        type: 'tools',
        typeConfidence: 'low',
        domain: trimmed,
        siteName: trimmed,
        suggestedTags: ['tools'],
        suggestedCategory: {
          name: 'Developer Tools',
          isExisting: false,
          confidence: 'low',
          reason: 'Default suggestion',
        },
        metadata: {},
      };
    }

    const domain = parsed.hostname.replace(/^www\./, '');
    const domainPrefix = domain.split('.')[0] || domain;
    const readableTitle = domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);

    const fallback: ExtractedMetadata = {
      title: readableTitle,
      description: '',
      previewImage: '',
      favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
      type: 'tools',
      typeConfidence: 'low',
      domain,
      siteName: readableTitle,
      suggestedTags: ['tools'],
      suggestedCategory: {
        name: 'Developer Tools',
        isExisting: false,
        confidence: 'low',
        reason: 'Default suggestion',
      },
      metadata: {},
    };

    // Check if it's a GitHub repo: github.com/:owner/:repo
    const ghMatch = parsed.hostname === 'github.com' && parsed.pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
    if (ghMatch) {
      const owner = ghMatch[1];
      const repo = ghMatch[2].replace(/\.git$/, '');
      if (owner && repo && owner !== 'settings' && owner !== 'explore' && owner !== 'topics') {
        const ghData = await this.fetchGitHubRepo(owner, repo);
        const classification = ClassificationService.classify(
          normalized,
          parsed,
          `${owner}/${repo}`,
          ghData?.description || '',
          [],
          ghData,
          context
        );

        return {
          title: `${owner}/${repo}`,
          description: ghData?.description || (ghData?.topics?.length ? `GitHub repository: ${ghData.topics.join(', ')}` : `GitHub repository by ${owner}`),
          previewImage: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
          favicon: 'https://github.githubassets.com/favicons/favicon.png',
          type: classification.type,
          typeConfidence: classification.typeConfidence,
          domain: 'github.com',
          siteName: 'GitHub',
          suggestedTags: classification.suggestedTags,
          suggestedCategory: classification.suggestedCategory,
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

      let currentUrl = normalized;
      let response: Response | null = null;
      let redirectCount = 0;
      const MAX_REDIRECTS = 3;

      while (redirectCount <= MAX_REDIRECTS) {
        const safe = await validateSafeUrl(currentUrl);
        if (!safe.safe) {
          logger.warn(`SSRF Block on redirect to ${currentUrl}: ${safe.reason}`);
          clearTimeout(timeoutId);
          return fallback;
        }

        const resp = await fetch(currentUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
          },
          signal: controller.signal,
          redirect: 'manual',
        });

        // Safe redirect handling
        if ([301, 302, 303, 307, 308].includes(resp.status)) {
          const location = resp.headers.get('location');
          if (!location) break;
          currentUrl = new URL(location, currentUrl).toString();
          redirectCount++;
          continue;
        }

        response = resp;
        break;
      }
      clearTimeout(timeoutId);

      if (!response || !response.ok) {
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

      // Extract Preview Image
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
      const rawKeywordsStr = $('meta[name="keywords"]').attr('content') || '';
      const rawKeywords = rawKeywordsStr
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      // Classify and generate tags & category suggestions
      const classification = ClassificationService.classify(
        normalized,
        parsed,
        title,
        description,
        rawKeywords,
        null,
        context
      );

      return {
        title,
        description,
        previewImage,
        favicon,
        type: classification.type,
        typeConfidence: classification.typeConfidence,
        domain,
        siteName,
        suggestedTags: classification.suggestedTags,
        suggestedCategory: classification.suggestedCategory,
        metadata: {},
      };
    } catch (err) {
      logger.debug(`Extraction fallback for ${normalized}`, { error: err });
      return fallback;
    }
  }
}
