/**
 * Georgian relative time without `Intl.RelativeTimeFormat` — production Node
 * builds with small-icu fall back to English for the 'ka' locale, so the
 * Georgian unit labels are spelled out here.
 */

const UNITS: { label: string; seconds: number }[] = [
  { label: 'წლის', seconds: 60 * 60 * 24 * 365 },
  { label: 'თვის', seconds: 60 * 60 * 24 * 30 },
  { label: 'დღის', seconds: 60 * 60 * 24 },
  { label: 'სთ', seconds: 60 * 60 },
  { label: 'წთ', seconds: 60 },
];

export function formatRelativeTime(date: Date | string | number, now: Date = new Date()): string {
  const target = date instanceof Date ? date : new Date(date);
  const diffSeconds = Math.round((now.getTime() - target.getTime()) / 1000);

  // Future or just-now timestamps.
  if (diffSeconds < 60) return 'ახლახან';

  for (const { label, seconds } of UNITS) {
    if (diffSeconds >= seconds) {
      const value = Math.floor(diffSeconds / seconds);
      return `${value} ${label} წინ`;
    }
  }
  return 'ახლახან';
}
