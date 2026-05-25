/**
 * Converts a Google Maps share URL or raw coordinates string into a Maps embed
 * src URL. Returns null when the input is not a recognizable Maps reference.
 */
export function buildMapEmbedSrc(url?: string): string | null {
  if (!url) return null;

  // Google Maps share/place URL → embed
  if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
    // Already an embed URL
    if (url.includes('/embed')) return url;
    // Convert share URL to embed URL using q= param
    try {
      const u = new URL(url);
      const q = u.searchParams.get('q') ?? url;
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    } catch {
      return null;
    }
  }

  // Coordinates like "41.6938,44.8015"
  const coordMatch = url.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
  }

  return null;
}
