import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { ErrorBoundary, ProfilePage, type PlayerProfile } from './ProfilePage';

let leftovers: ReturnType<typeof deferred<PlayerProfile>>[] = [];
afterEach(async () => {
  await act(async () => {
    for (const d of leftovers) d.reject(new Error('test over'));
  });
  leftovers = [];
});

/** fetchProfile returns a fresh deferred per call; `respond(i)` settles call i. */
function setup(initialUsername = 'Steve') {
  const calls: { username: string; d: ReturnType<typeof deferred<PlayerProfile>> }[] = [];
  const fetchProfile = vi.fn((username: string) => {
    const d = deferred<PlayerProfile>();
    d.promise.catch(() => {}); // the component handles it; this just keeps the test runner quiet
    calls.push({ username, d });
    leftovers.push(d);
    return d.promise;
  });
  const ui = (username: string) => <ProfilePage username={username} fetchProfile={fetchProfile} />;
  const view = render(ui(initialUsername));
  const respond = (i: number, achievements = 42) =>
    act(async () => calls[i]!.d.resolve({ username: calls[i]!.username, achievements }));
  const fail = (i: number) => act(async () => calls[i]!.d.reject(new Error('503')));
  return { fetchProfile, calls, respond, fail, show: (u: string) => view.rerender(ui(u)) };
}

describe('6.3 ProfilePage (use + Suspense + an error boundary)', () => {
  it('shows "Loading profile…" while the request is pending, then the profile', async () => {
    const { respond } = setup('Steve');
    expect(screen.getByRole('status')).toHaveTextContent('Loading profile…');
    await respond(0, 42);
    expect(await screen.findByRole('heading', { name: 'Steve' })).toBeInTheDocument();
    expect(screen.getByText('42 achievements')).toBeInTheDocument();
    expect(screen.queryByText('Loading profile…')).toBeNull();
  });

  it('fetches once per username, no matter how often it re-renders (no new promise per render!)', async () => {
    const { fetchProfile, respond, show } = setup('Steve');
    show('Steve');
    show('Steve');
    await respond(0);
    await screen.findByRole('heading', { name: 'Steve' });
    show('Steve');
    expect(fetchProfile).toHaveBeenCalledTimes(1);
  });

  it('switching players loads the new one; switching back uses the cache, with no request and no spinner', async () => {
    const { fetchProfile, respond, show } = setup('Steve');
    await respond(0, 42);
    await screen.findByRole('heading', { name: 'Steve' });

    show('Alex');
    expect(screen.getByText('Loading profile…')).toBeInTheDocument();
    await respond(1, 7);
    expect(await screen.findByRole('heading', { name: 'Alex' })).toBeInTheDocument();

    show('Steve');
    expect(screen.getByRole('heading', { name: 'Steve' })).toBeInTheDocument();
    expect(screen.queryByText('Loading profile…')).toBeNull();
    expect(fetchProfile).toHaveBeenCalledTimes(2);
  });

  it("shows an alert when loading fails, and 'Try again' fetches again and recovers", async () => {
    const { fetchProfile, fail, respond } = setup('Steve');
    await fail(0);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load Steve's profile.");

    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(fetchProfile).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Loading profile…')).toBeInTheDocument();
    await respond(1, 42);
    expect(await screen.findByRole('heading', { name: 'Steve' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it("one player's error doesn't stick when you switch to another player", async () => {
    const { fail, respond, show } = setup('Steve');
    await fail(0);
    await screen.findByRole('alert');
    show('Alex');
    expect(screen.queryByRole('alert')).toBeNull();
    await respond(1);
    expect(await screen.findByRole('heading', { name: 'Alex' })).toBeInTheDocument();
  });

  it('ErrorBoundary renders its fallback when a child throws while rendering', () => {
    function Creeper(): never {
      throw new Error('Sssss… BOOM');
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {}); // React logs caught errors
    render(
      <ErrorBoundary fallback={<p>Something exploded.</p>}>
        <Creeper />
      </ErrorBoundary>,
    );
    spy.mockRestore();
    expect(screen.getByText('Something exploded.')).toBeInTheDocument();
  });
});
