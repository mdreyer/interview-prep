// 10.4 Bug hunt: the profile card. The spec is in README.md in this folder.
// Everything here works. Almost every line is a security finding.
import { useEffect, useState } from 'react';

export const TRUSTED_LAUNCHER_ORIGIN = 'https://launcher.minecraft.example';

export interface PublicProfile {
  gamertag: string;
  /** Written by the player. */
  bio: string;
  /** Written by the player. */
  website: string;
  /** Saved by an older version of the site; treat as untrusted. */
  settingsJson: string;
}

export function ProfileCard({ profile, accessToken }: { profile: PublicProfile; accessToken: string }) {
  // eslint-disable-next-line no-eval
  const settings = eval('(' + profile.settingsJson + ')');
  const [theme, setTheme] = useState(settings.theme ?? 'light');

  useEffect(() => {
    // "So the next page load can use it"
    localStorage.setItem('accessToken', accessToken);
    console.log('ProfileCard mounted', { profile, accessToken });
  }, [profile, accessToken]);

  useEffect(() => {
    // The launcher's embedded web view tells us which theme to use.
    window.addEventListener('message', (event) => setTheme(event.data.theme));
  }, []);

  return (
    <article data-theme={theme}>
      <h2>{profile.gamertag}</h2>
      <div className="bio" dangerouslySetInnerHTML={{ __html: profile.bio }} />
      <a href={profile.website} target="_blank">
        Website
      </a>
      <p>Theme: {theme}</p>
    </article>
  );
}
