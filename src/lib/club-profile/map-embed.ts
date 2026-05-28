/**
 * Converts a Google Maps share URL, raw coordinates, or a plain address into a
 * Google Maps embed `src` URL. Returns null only when the input is empty.
 *
 * Recognises (in order): already-embed URLs (passed through), "lat,lng"
 * coordinates, Maps URLs with an `@lat,lng` path or a `q=` param, and finally
 * any other non-empty string as a generic Maps search query. The query value
 * is always run through encodeURIComponent, so arbitrary user text cannot break
 * out of the fixed google.com origin.
 */
export function buildMapEmbedSrc(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already an embed URL — pass through unchanged.
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // Raw coordinates: "41.6938,44.8015" or "41.6938 44.8015".
  const coordMatch = trimmed.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
  }

  // Google Maps share / place URL → extract coordinates or the q param.
  if (trimmed.includes('google.com/maps') || trimmed.includes('maps.google.com')) {
    try {
      const u = new URL(trimmed);
      const atMatch = u.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (atMatch) {
        return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`;
      }
      const q = u.searchParams.get('q');
      if (q) {
        return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
      }
      // Maps URL with neither coordinates nor a q param — embed the whole URL.
      return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
    } catch {
      return null;
    }
  }

  // Anything else (a plain address, place name, etc.) → Maps search embed.
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}
