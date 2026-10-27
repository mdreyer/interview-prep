import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileCard, TRUSTED_LAUNCHER_ORIGIN, type PublicProfile } from './ProfileCard';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.secret-access-token.sig';
const SAFE: PublicProfile = {
  gamertag: 'Alex_Builds',
  bio: 'I build castles.\nAsk me about redstone!',
  website: 'https://www.youtube.com/@AlexBuilds',
  settingsJson: '{"theme":"dark"}',
};

type Pwned = { __pwned?: boolean };
afterEach(() => {
  delete (window as Pwned).__pwned;
  window.localStorage.clear();
  window.sessionStorage.clear();
});

function setup(overrides: Partial<PublicProfile> = {}) {
  return render(<ProfileCard profile={{ ...SAFE, ...overrides }} accessToken={TOKEN} />);
}

const post = (origin: string, data: unknown) =>
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { origin, data }));
  });

describe('10.4 Bug hunt: profile card', () => {
  it('renders the bio as text: HTML in it is shown, never run', () => {
    const { container } = setup({ bio: 'hi <img src=x onerror="window.__pwned=true"><script>window.__pwned=true</script>' });
    expect(container.querySelector('.bio img, .bio script')).toBeNull();
    expect(screen.getByText(/hi <img src=x/)).toBeInTheDocument();
    expect((window as Pwned).__pwned).toBeUndefined();
  });

  it('links a safe website, opening it without giving it access to this page', () => {
    setup();
    const link = screen.getByRole('link', { name: 'Website' });
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/@AlexBuilds');
    expect(link.getAttribute('rel') ?? '').toContain('noopener');
  });

  it("doesn't link a javascript: website", () => {
    setup({ website: 'javascript:alert(document.cookie)' });
    expect(screen.queryByRole('link', { name: 'Website' })).toBeNull();
  });

  it('reads saved settings without executing them', () => {
    setup({ settingsJson: 'window.__pwned = true, {"theme":"dark"}' });
    expect((window as Pwned).__pwned).toBeUndefined();
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
  });

  it('uses a valid saved theme, and ignores invalid ones', () => {
    const { unmount } = setup({ settingsJson: '{"theme":"dark"}' });
    expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    unmount();
    setup({ settingsJson: '{"theme":"<b>purple</b>"}' });
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
  });

  it('only accepts theme messages from the trusted launcher origin, with the expected shape', async () => {
    setup({ settingsJson: '{"theme":"light"}' });
    await post('https://evil.example', { type: 'set-theme', theme: 'dark' });
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
    await post(TRUSTED_LAUNCHER_ORIGIN, { type: 'set-theme', theme: '<img src=x>' });
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
    await post(TRUSTED_LAUNCHER_ORIGIN, 'dark');
    expect(screen.getByText('Theme: light')).toBeInTheDocument();
    await post(TRUSTED_LAUNCHER_ORIGIN, { type: 'set-theme', theme: 'dark' });
    expect(screen.getByText('Theme: dark')).toBeInTheDocument();
  });

  it('removes its message listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = setup();
    unmount();
    expect(spy.mock.calls.some(([type]) => type === 'message')).toBe(true);
    spy.mockRestore();
  });

  it('never writes the access token to localStorage or sessionStorage', () => {
    setup();
    const dump = (storage: Storage) =>
      Array.from({ length: storage.length }, (_, i) => `${storage.key(i)}=${storage.getItem(storage.key(i)!)}`).join('\n');
    const stored = dump(window.localStorage) + dump(window.sessionStorage);
    expect(stored).not.toContain('secret-access-token');
  });

  it('never logs the access token', () => {
    const spies = (['log', 'info', 'debug', 'warn'] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => {}));
    setup();
    const logged = spies.flatMap((s) => s.mock.calls).map((args) => JSON.stringify(args));
    spies.forEach((s) => s.mockRestore());
    expect(logged.join('\n')).not.toContain('secret-access-token');
  });
});
