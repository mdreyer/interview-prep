// 9.1 Intl formatting. The spec is in README.md in this folder.
// Use the built-in Intl APIs. No libraries, and no hand-written number or date formatting.

/** Money arrives from the C# API in minor units (cents, or whole yen). */
export function formatMoney(minorUnits: number, currency: string, locale: string): string {
  // TODO
  return `$${(minorUnits / 100).toFixed(2)}`;
}

export function formatCompact(value: number, locale: string): string {
  // TODO
  return String(value);
}

export function formatRelativeTime(date: Date, now: Date, locale: string): string {
  // TODO
  const days = Math.round((now.getTime() - date.getTime()) / 86_400_000);
  return `${days} days ago`;
}

export function formatList(items: string[], locale: string, type: 'conjunction' | 'disjunction' = 'conjunction'): string {
  // TODO
  return items.join(', ');
}

export function formatDate(date: Date, locale: string, timeZone: string): string {
  // TODO
  return date.toLocaleDateString();
}
