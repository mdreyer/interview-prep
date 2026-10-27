// 9.4 Bug hunt: the season leaderboard. The spec is in README.md in this folder.
// It looks perfect... in en-US. Switch the locale and count the bugs.
// (The column headers stay in English for this exercise: 9.2 is how you'd translate them.)

export interface LeaderboardPlayer {
  name: string;
  score: number;
  /** 0 to 1 */
  winRate: number;
  /** ISO 3166 region code, e.g. "DE" */
  country: string;
  lastPlayed: Date;
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  DE: 'Germany',
  BR: 'Brazil',
  JP: 'Japan',
};

const DAY = 24 * 60 * 60 * 1000;

export function Leaderboard({
  locale,
  timeZone,
  now,
  seasonEnd,
  players,
}: {
  locale: string;
  timeZone: string;
  now: Date;
  seasonEnd: Date;
  players: LeaderboardPlayer[];
}) {
  const ranked = [...players].sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1));
  const countries = [...new Set(ranked.map((p) => COUNTRY_NAMES[p.country] ?? p.country))];

  return (
    <section>
      <table aria-label="Leaderboard">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Rank</th>
            <th style={{ textAlign: 'left' }}>Player</th>
            <th style={{ textAlign: 'right' }}>Score</th>
            <th style={{ textAlign: 'right' }}>Win rate</th>
            <th style={{ textAlign: 'left' }}>Country</th>
            <th style={{ textAlign: 'left' }}>Last played</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((p, i) => {
            const days = Math.round((now.getTime() - p.lastPlayed.getTime()) / DAY);
            return (
              <tr key={p.name}>
                <td style={{ textAlign: 'left', paddingLeft: 8 }}>{i + 1}</td>
                <td style={{ textAlign: 'left', paddingLeft: 8 }}>{p.name}</td>
                <td style={{ textAlign: 'right', paddingRight: 8 }}>{p.score.toString()}</td>
                <td style={{ textAlign: 'right', paddingRight: 8 }}>{Math.round(p.winRate * 100) + '%'}</td>
                <td style={{ textAlign: 'left', paddingLeft: 8 }}>{COUNTRY_NAMES[p.country] ?? p.country}</td>
                <td style={{ textAlign: 'left', paddingLeft: 8 }}>{days + ' days ago'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>Players from {countries.join(', ')}</p>
      <p>Season ends {seasonEnd.toLocaleDateString()}</p>
    </section>
  );
}
