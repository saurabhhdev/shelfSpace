import dns from 'dns/promises';
import { URL } from 'url';

/**
 * Validates if an IP address is private, loopback, or reserved
 */
export function isPrivateIP(ip: string): boolean {
  // IPv4 loopback (127.0.0.0/8)
  if (/^127\./.test(ip)) return true;
  // IPv4 private (10.0.0.0/8)
  if (/^10\./.test(ip)) return true;
  // IPv4 private (172.16.0.0/12)
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // IPv4 private (192.168.0.0/16)
  if (/^192\.168\./.test(ip)) return true;
  // Link-local & Cloud Metadata (169.254.0.0/16, e.g. 169.254.169.254)
  if (/^169\.254\./.test(ip)) return true;
  // Carrier-grade NAT (100.64.0.0/10)
  if (/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(ip)) return true;
  // Current network (0.0.0.0/8)
  if (/^0\./.test(ip)) return true;
  // Documentation ranges (TEST-NET-1, TEST-NET-2, TEST-NET-3)
  if (/^192\.0\.2\./.test(ip) || /^198\.51\.100\./.test(ip) || /^203\.0\.113\./.test(ip)) return true;
  // Benchmark tests (198.18.0.0/15)
  if (/^198\.(1[8-9])\./.test(ip)) return true;
  // Multicast & Broadcast (224.0.0.0/4 and 255.255.255.255)
  if (/^(22[4-9]|2[3-4][0-9]|25[0-5])\./.test(ip)) return true;
  if (ip === '255.255.255.255') return true;

  // IPv6
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // Unique local
  if (normalized.startsWith('fe80:')) return true; // Link-local
  if (normalized.startsWith('2001:db8:')) return true; // Documentation
  if (normalized.startsWith('::ffff:')) {
    // IPv4-mapped IPv6
    const ipv4 = normalized.substring(7);
    return isPrivateIP(ipv4);
  }

  return false;
}

/**
 * Validates a target URL against SSRF attacks:
 * - Only http and https protocols allowed
 * - Resolves hostname to IP and verifies it is not a private/reserved address
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; url: URL; reason?: string }> {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, url: parsed, reason: 'Invalid protocol. Only HTTP and HTTPS are permitted.' };
    }

    const hostname = parsed.hostname;
    if (!hostname) {
      return { safe: false, url: parsed, reason: 'Missing hostname.' };
    }

    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.arpa') ||
      hostname.endsWith('.lan') ||
      hostname === 'metadata.google.internal' ||
      hostname === 'instance-data'
    ) {
      return { safe: false, url: parsed, reason: 'Internal or cloud metadata domain is blocked.' };
    }

    // Direct IP address check without needing DNS lookup
    if (isPrivateIP(hostname)) {
      return { safe: false, url: parsed, reason: `Direct restricted IP address is blocked: ${hostname}` };
    }

    // Resolve DNS
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const addr of addresses) {
        if (isPrivateIP(addr.address)) {
          return { safe: false, url: parsed, reason: `Resolves to restricted IP: ${addr.address}` };
        }
      }
    } catch (dnsErr) {
      return { safe: false, url: parsed, reason: 'Could not resolve domain name.' };
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, url: new URL('http://invalid'), reason: err.message || 'Invalid URL' };
  }
}
