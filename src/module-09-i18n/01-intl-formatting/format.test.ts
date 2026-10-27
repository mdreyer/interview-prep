import { describe, expect, it } from 'vitest';
import { formatCompact, formatDate, formatList, formatMoney, formatRelativeTime } from './format';

/** Intl uses non-breaking spaces (U+00A0, U+202F) in many locales. Normalize them so the expectations are readable. */
const n = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

describe('9.1 Intl formatting', () => {
  it('formatMoney: minor units -> the right amount and symbol for each currency and locale', () => {
    expect(n(formatMoney(123450, 'USD', 'en-US'))).toBe('$1,234.50');
    expect(n(formatMoney(123450, 'EUR', 'de-DE'))).toBe('1.234,50 €');
    expect(n(formatMoney(123450, 'EUR', 'fr-FR'))).toBe('1 234,50 €');
    expect(n(formatMoney(1990, 'BRL', 'pt-BR'))).toBe('R$ 19,90');
  });

  it("formatMoney: doesn't assume every currency has cents (JPY has none)", () => {
    expect(n(formatMoney(990, 'JPY', 'ja-JP'))).toBe('￥990');
    expect(n(formatMoney(990, 'JPY', 'en-US'))).toBe('¥990');
  });

  it('formatCompact: player counts the way each locale abbreviates them', () => {
    expect(formatCompact(1500, 'en-US')).toBe('1.5K');
    expect(formatCompact(1_234_567, 'en-US')).toBe('1.2M');
    expect(n(formatCompact(1_234_567, 'de-DE'))).toBe('1,2 Mio.');
    expect(formatCompact(1_234_567, 'ja-JP')).toBe('123万');
  });

  it('formatRelativeTime: picks a sensible unit, in the past and the future', () => {
    const now = new Date('2026-10-06T12:00:00Z');
    const ago = (ms: number) => new Date(now.getTime() - ms);
    const sec = 1000;
    const min = 60 * sec;
    const hour = 60 * min;
    const day = 24 * hour;
    expect(formatRelativeTime(ago(30 * sec), now, 'en')).toBe('30 seconds ago');
    expect(formatRelativeTime(ago(5 * min), now, 'en')).toBe('5 minutes ago');
    expect(formatRelativeTime(ago(2 * hour), now, 'en')).toBe('2 hours ago');
    expect(formatRelativeTime(ago(3 * day), now, 'en')).toBe('3 days ago');
    expect(formatRelativeTime(ago(14 * day), now, 'en')).toBe('2 weeks ago');
    expect(formatRelativeTime(ago(60 * day), now, 'en')).toBe('2 months ago');
    expect(formatRelativeTime(ago(800 * day), now, 'en')).toBe('2 years ago');
  });

  it('formatRelativeTime: uses words like "yesterday" and "tomorrow", in every language', () => {
    const now = new Date('2026-10-06T12:00:00Z');
    const day = 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(new Date(now.getTime() - day), now, 'en')).toBe('yesterday');
    expect(formatRelativeTime(new Date(now.getTime() + day), now, 'en')).toBe('tomorrow');
    expect(formatRelativeTime(new Date(now.getTime() - 3 * day), now, 'de')).toBe('vor 3 Tagen');
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 60 * 60 * 1000), now, 'es')).toBe('hace 2 horas');
  });

  it('formatList: "A, B, and C" is different in every language', () => {
    expect(formatList(['Steve', 'Alex', 'Notch'], 'en')).toBe('Steve, Alex, and Notch');
    expect(formatList(['Steve', 'Alex'], 'en')).toBe('Steve and Alex');
    expect(formatList(['Steve', 'Alex', 'Notch'], 'de')).toBe('Steve, Alex und Notch');
    expect(formatList(['Steve', 'Alex', 'Notch'], 'ja')).toBe('Steve、Alex、Notch');
    expect(formatList(['Steve', 'Alex', 'Notch'], 'en', 'disjunction')).toBe('Steve, Alex, or Notch');
  });

  it("formatDate: uses the given time zone, not the computer's", () => {
    const launch = new Date('2026-10-06T15:30:00Z');
    expect(formatDate(launch, 'en-US', 'America/Los_Angeles')).toBe('Oct 6, 2026');
    expect(formatDate(launch, 'en-US', 'Asia/Tokyo')).toBe('Oct 7, 2026');
    expect(formatDate(launch, 'de-DE', 'Europe/Berlin')).toBe('06.10.2026');
    expect(formatDate(launch, 'en-GB', 'Europe/London')).toBe('6 Oct 2026');
  });
});
