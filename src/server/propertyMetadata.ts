const DEFAULT_SITE_URL = 'https://tenantowners.in';
const FALLBACK_IMAGE_PATH = '/tenantowners-social-fallback.png';
const SOCIAL_METADATA_PATTERN = /<!-- SOCIAL_METADATA_START -->[\s\S]*?<!-- SOCIAL_METADATA_END -->/;

export interface PublicPropertyPreview {
  id: string;
  title: string;
  description?: string | null;
  listing_type?: string | null;
  price?: number | string | null;
  location?: string | null;
  society?: string | null;
  imageUrl?: string | null;
}

export interface SocialMetadata {
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string;
  robots?: string;
}

export function getSiteUrl(): string {
  const configured = process.env.PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return DEFAULT_SITE_URL;
    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, maximum = 200): string {
  if (value.length <= maximum) return value;
  return `${value.slice(0, maximum - 1).trimEnd()}…`;
}

function formatPrice(property: PublicPropertyPreview): string {
  const value = Number(property.price);
  if (!Number.isFinite(value) || value <= 0) return '';
  const amount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
  return property.listing_type === 'rent' ? `${amount}/month` : amount;
}

export function isPublicHttpsImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    const expiringParameters = [
      'expires',
      'token',
      'signature',
      'x-amz-expires',
      'x-amz-signature',
      'x-goog-expires',
      'x-goog-signature',
      'se',
      'sig',
    ];
    const parameterNames = new Set([...url.searchParams.keys()].map((name) => name.toLowerCase()));
    const hasExpiringSignature = expiringParameters.some((name) => parameterNames.has(name));
    return url.protocol === 'https:'
      && !['localhost', '127.0.0.1', '::1'].includes(url.hostname.toLowerCase())
      && !hasExpiringSignature;
  } catch {
    return false;
  }
}

export function buildPropertyMetadata(property: PublicPropertyPreview): SocialMetadata {
  const siteUrl = getSiteUrl();
  const propertyTitle = cleanText(property.title) || 'Property';
  const place = cleanText(property.society) || cleanText(property.location);
  const price = formatPrice(property);
  const summary = truncate(cleanText(property.description), 140);
  const details = [place && `in ${place}`, price, summary].filter(Boolean).join(' • ');

  return {
    title: `${propertyTitle} | TenanTOwners`,
    description: truncate(details || `View ${propertyTitle} on TenanTOwners.`),
    imageUrl: isPublicHttpsImageUrl(property.imageUrl)
      ? property.imageUrl.trim()
      : `${siteUrl}${FALLBACK_IMAGE_PATH}`,
    canonicalUrl: `${siteUrl}/property/${encodeURIComponent(property.id)}`,
  };
}

export function buildMissingPropertyMetadata(propertyId: string): SocialMetadata {
  const siteUrl = getSiteUrl();
  return {
    title: 'Property Not Found | TenanTOwners',
    description: 'This property is unavailable. Browse current Rent and Sale listings on TenanTOwners.',
    imageUrl: `${siteUrl}${FALLBACK_IMAGE_PATH}`,
    canonicalUrl: `${siteUrl}/property/${encodeURIComponent(propertyId)}`,
    robots: 'noindex, follow',
  };
}

export function renderSocialMetadata(metadata: SocialMetadata): string {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const imageUrl = escapeHtml(metadata.imageUrl);
  const canonicalUrl = escapeHtml(metadata.canonicalUrl);
  const robots = metadata.robots
    ? `\n    <meta name="robots" content="${escapeHtml(metadata.robots)}" />`
    : '';

  return `<!-- SOCIAL_METADATA_START -->
    <title>${title}</title>
    <meta name="description" content="${description}" />${robots}
    <link rel="canonical" href="${canonicalUrl}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TenanTOwners" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:url" content="${canonicalUrl}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <!-- SOCIAL_METADATA_END -->`;
}

export function injectSocialMetadata(html: string, metadata: SocialMetadata): string {
  if (!SOCIAL_METADATA_PATTERN.test(html)) {
    throw new Error('The HTML template is missing social metadata markers.');
  }
  return html.replace(SOCIAL_METADATA_PATTERN, renderSocialMetadata(metadata));
}
