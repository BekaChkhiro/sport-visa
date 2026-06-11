/**
 * Georgian date/time formatting that does not depend on the runtime's ICU
 * data. Production Node builds with small-icu silently fall back to English
 * for `Intl.*Format('ka')`, so month/weekday names are spelled out here.
 */

const KA_MONTHS_LONG = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
] as const;

const KA_MONTHS_SHORT = [
  'იან',
  'თებ',
  'მარ',
  'აპრ',
  'მაი',
  'ივნ',
  'ივლ',
  'აგვ',
  'სექ',
  'ოქტ',
  'ნოე',
  'დეკ',
] as const;

const KA_WEEKDAYS = [
  'კვირა',
  'ორშაბათი',
  'სამშაბათი',
  'ოთხშაბათი',
  'ხუთშაბათი',
  'პარასკევი',
  'შაბათი',
] as const;

type FormatKaDateOptions = {
  /** Prefix with the weekday name, e.g. "ხუთშაბათი, 11 ივნისი". */
  weekday?: boolean;
  /** Month style; defaults to 'long'. */
  month?: 'long' | 'short';
  /** Append the year, e.g. "28 მაი, 2026". */
  year?: boolean;
};

export function formatKaDate(
  date: Date | string | number,
  { weekday = false, month = 'long', year = false }: FormatKaDateOptions = {},
): string {
  const d = date instanceof Date ? date : new Date(date);
  const months = month === 'short' ? KA_MONTHS_SHORT : KA_MONTHS_LONG;
  let out = `${d.getDate()} ${months[d.getMonth()]}`;
  if (weekday) out = `${KA_WEEKDAYS[d.getDay()]}, ${out}`;
  if (year) out = `${out}, ${d.getFullYear()}`;
  return out;
}

/** Numeric form, e.g. "28.05.2026". */
export function formatKaDateNumeric(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

/** 24-hour clock, e.g. "14:30". */
export function formatKaTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
