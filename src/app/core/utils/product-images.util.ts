const FALLBACK_PRODUCT_IMAGE = 'https://via.placeholder.com/600x600?text=Product';

export function parseRawProductImageUrls(rawValue: string | null | undefined, maxImages = 5): string[] {
  if (!rawValue) {
    return [];
  }

  const uniqueUrls = new Set<string>();
  const parsed = rawValue
    .split(/[,\r\n]+/)
    .map((url) => url.trim())
    .filter(Boolean)
    .filter((url) => {
      if (uniqueUrls.has(url)) {
        return false;
      }

      uniqueUrls.add(url);
      return true;
    });

  return parsed.slice(0, Math.max(1, maxImages));
}

export function getProductImageUrls(
  rawValue: string | null | undefined,
  maxImages = 5,
  fallbackUrl = FALLBACK_PRODUCT_IMAGE
): string[] {
  const urls = parseRawProductImageUrls(rawValue, maxImages);
  return urls.length > 0 ? urls : [fallbackUrl];
}

export function getPrimaryProductImageUrl(
  rawValue: string | null | undefined,
  maxImages = 5,
  fallbackUrl = FALLBACK_PRODUCT_IMAGE
): string {
  return getProductImageUrls(rawValue, maxImages, fallbackUrl)[0];
}

export function normalizeProductImageUrls(rawValue: string | null | undefined, maxImages = 5): string {
  return parseRawProductImageUrls(rawValue, maxImages).join(',');
}

