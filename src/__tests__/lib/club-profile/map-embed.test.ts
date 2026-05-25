import { describe, expect, it } from 'vitest';

import { buildMapEmbedSrc } from '@/lib/club-profile/map-embed';

describe('buildMapEmbedSrc', () => {
  it('returns null for undefined', () => {
    expect(buildMapEmbedSrc(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(buildMapEmbedSrc('')).toBeNull();
  });

  it('returns null for an unrecognised URL', () => {
    expect(buildMapEmbedSrc('https://example.com/somewhere')).toBeNull();
  });

  it('returns null for plain text', () => {
    expect(buildMapEmbedSrc('თბილისი')).toBeNull();
  });

  // ── Already-embed URLs ──────────────────────────────────────────────────────

  it('passes through an already-embed google.com/maps URL unchanged', () => {
    const src = 'https://www.google.com/maps/embed?pb=!1m18';
    expect(buildMapEmbedSrc(src)).toBe(src);
  });

  it('passes through an already-embed maps.google.com URL unchanged', () => {
    const src = 'https://maps.google.com/maps/embed?q=Tbilisi';
    expect(buildMapEmbedSrc(src)).toBe(src);
  });

  // ── Share / place URLs ──────────────────────────────────────────────────────

  it('converts a google.com/maps share URL with a q param to an embed URL', () => {
    const share = 'https://www.google.com/maps?q=Boris+Paichadze+Arena';
    const result = buildMapEmbedSrc(share);
    expect(result).toContain('output=embed');
    // encodeURIComponent encodes spaces as %20; the q value comes from the URL param
    expect(result).toContain('Boris');
    expect(result).toContain('Arena');
  });

  it('falls back to the full URL as q when no q param is present', () => {
    const share = 'https://www.google.com/maps/place/Tbilisi';
    const result = buildMapEmbedSrc(share);
    expect(result).not.toBeNull();
    expect(result).toContain('output=embed');
  });

  it('converts a maps.google.com share URL', () => {
    const share = 'https://maps.google.com/?q=41.6938,44.8015';
    const result = buildMapEmbedSrc(share);
    expect(result).toContain('output=embed');
  });

  // ── Raw coordinate strings ──────────────────────────────────────────────────

  it('converts "lat,lng" coordinate string to embed URL', () => {
    const result = buildMapEmbedSrc('41.6938,44.8015');
    expect(result).toBe('https://www.google.com/maps?q=41.6938,44.8015&output=embed');
  });

  it('handles coordinate string with a space after the comma', () => {
    const result = buildMapEmbedSrc('41.6938, 44.8015');
    expect(result).toBe('https://www.google.com/maps?q=41.6938,44.8015&output=embed');
  });

  it('handles negative latitude/longitude coordinates', () => {
    const result = buildMapEmbedSrc('-34.6037,-58.3816');
    expect(result).toBe('https://www.google.com/maps?q=-34.6037,-58.3816&output=embed');
  });

  it('handles integer coordinates without decimal points', () => {
    const result = buildMapEmbedSrc('41,44');
    expect(result).toBe('https://www.google.com/maps?q=41,44&output=embed');
  });

  it('returns null for a string that looks like coords but has extra text', () => {
    expect(buildMapEmbedSrc('41.6938,44.8015 extra')).toBeNull();
  });
});
