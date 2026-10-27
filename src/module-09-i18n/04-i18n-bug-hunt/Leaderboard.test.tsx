import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Leaderboard, type LeaderboardPlayer } from './Leaderboard';

const NOW = new Date('2026-10-06T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY);
const SEASON_END = new Date('2026-10-30T15:00:00Z'); // already Oct 31 in Tokyo

const PLAYERS: LeaderboardPlayer[] = [
  { name: 'Zoe', score: 1_234_567, winRate: 0.853, country: 'DE', lastPlayed: daysAgo(1) },
  { name: 'émile', score: 1_234_567, winRate: 0.5, country: 'BR', lastPlayed: daysAgo(3) },
  { name: 'Ana', score: 1_234_567, winRate: 0.25, country: 'DE', lastPlayed: daysAgo(0) },
  { name: 'oscar', score: 98_000, winRate: 0.1, country: 'JP', lastPlayed: daysAgo(2) },
];

/** Intl uses non-breaking spaces in some locales; normalize them so expectations are readable. */
const n = (s: string | null) => (s ?? '').replace(/[\u00a0\u202f]/g, ' ').trim();

function setup(locale: string) {
  render(<Leaderboard locale={locale} timeZone="Asia/Tokyo" now={NOW} seasonEnd={SEASON_END} players={PLAYERS} />);
  const rows = within(screen.getByRole('table', { name: 'Leaderboard' })).getAllByRole('row').slice(1);
  const cells = rows.map((r) => within(r).getAllByRole('cell').map((c) => n(c.textContent)));
  const column = (i: number) => cells.map((row) => row[i]);
  return { rows, cells, column };
}

describe('9.4 Bug hunt: season leaderboard', () => {
  it('breaks score ties alphabetically the way people expect (accents and case included)', () => {
    const { column } = setup('en-US');
    expect(column(1)).toEqual(['Ana', 'émile', 'Zoe', 'oscar']);
  });

  it('formats scores for the locale', () => {
    expect(setup('en-US').column(2)).toEqual(['1,234,567', '1,234,567', '1,234,567', '98,000']);
  });

  it('formats scores for German too', () => {
    expect(setup('de-DE').column(2)).toEqual(['1.234.567', '1.234.567', '1.234.567', '98.000']);
  });

  it('formats win rates as locale percentages', () => {
    expect(setup('de-DE').column(3)).toEqual(['25 %', '50 %', '85 %', '10 %']);
  });

  it("names countries in the reader's language (no hard-coded English map)", () => {
    expect(setup('de-DE').column(4)).toEqual(['Deutschland', 'Brasilien', 'Deutschland', 'Japan']);
  });

  it('says "today", "yesterday" and "3 days ago", and their German equivalents', () => {
    expect(setup('en-US').column(5)).toEqual(['today', '3 days ago', 'yesterday', '2 days ago']);
  });

  it('…in German', () => {
    expect(setup('de-DE').column(5)).toEqual(['heute', 'vor 3 Tagen', 'gestern', 'vorgestern']);
  });

  it("joins the country list with the locale's 'and'", () => {
    setup('de-DE');
    expect(n(screen.getByText(/^Players from/).textContent)).toBe('Players from Deutschland, Brasilien und Japan');
  });

  it('shows the season end date in the locale and in the given time zone', () => {
    setup('de-DE');
    expect(n(screen.getByText(/^Season ends/).textContent)).toBe('Season ends 31. Oktober 2026');
  });

  it('uses logical CSS (start/end), not left/right, so the table mirrors in right-to-left languages', () => {
    const { rows } = setup('en-US');
    const styled = [...rows.flatMap((r) => within(r).getAllByRole('cell')), ...screen.getAllByRole('columnheader')];
    for (const el of styled) {
      expect(['left', 'right']).not.toContain(el.style.textAlign);
      expect(el.style.paddingLeft).toBe('');
      expect(el.style.paddingRight).toBe('');
    }
  });
});
