import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RealmStatus, type RealmStatusResult } from './RealmStatus';
import { deferred, wait } from '../test-utils';

const INTERVAL = 40;
const online = (playerCount: number): RealmStatusResult => ({ online: true, playerCount });

describe('2.1 RealmStatus', () => {
  it('checks immediately on mount and shows "Checking status…" until the first response', async () => {
    const first = deferred<RealmStatusResult>();
    const fetchStatus = vi.fn(() => first.promise);
    render(<RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={INTERVAL} />);

    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(fetchStatus).toHaveBeenCalledWith('realm-1');
    expect(screen.getByRole('status')).toHaveTextContent('Checking status…');

    await wait(0);
    first.resolve(online(3));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Online: 3 players'));
  });

  it('uses the singular for one player and shows Offline', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(online(1));
    const { rerender } = render(
      <RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={INTERVAL} />,
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Online: 1 player'));
    expect(screen.getByRole('status')).not.toHaveTextContent('players');

    const offlineFetch = vi.fn().mockResolvedValue({ online: false, playerCount: 0 });
    rerender(<RealmStatus realmId="realm-2" fetchStatus={offlineFetch} intervalMs={INTERVAL} />);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Offline'));
  });

  it('polls every intervalMs', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(online(2));
    render(<RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={INTERVAL} />);
    await waitFor(() => expect(fetchStatus.mock.calls.length).toBeGreaterThanOrEqual(4), {
      timeout: 1000,
    });
  });

  it('never calls fetchStatus after unmounting', async () => {
    const fetchStatus = vi.fn().mockResolvedValue(online(2));
    const { unmount } = render(
      <RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={INTERVAL} />,
    );
    await wait(INTERVAL * 1.5);
    unmount();
    const callsAtUnmount = fetchStatus.mock.calls.length;
    expect(callsAtUnmount).toBeGreaterThanOrEqual(1);
    await wait(INTERVAL * 4);
    expect(fetchStatus.mock.calls.length).toBe(callsAtUnmount);
  });

  it('switches realms: resets, checks the new realm right away, and ignores stale responses', async () => {
    const realm1 = deferred<RealmStatusResult>();
    const fetchStatus = vi.fn((id: string) =>
      id === 'realm-1' ? realm1.promise : Promise.resolve(online(7)),
    );
    const { rerender } = render(
      <RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={10_000} />,
    );
    expect(fetchStatus).toHaveBeenLastCalledWith('realm-1');

    rerender(<RealmStatus realmId="realm-2" fetchStatus={fetchStatus} intervalMs={10_000} />);
    expect(fetchStatus).toHaveBeenLastCalledWith('realm-2');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Online: 7 players'));

    // The slow realm-1 response finally arrives. It must not overwrite realm-2's status.
    realm1.resolve(online(99));
    await wait(20);
    expect(screen.getByRole('status')).toHaveTextContent('Online: 7 players');
  });

  it('shows "Checking status…" again right after switching realms', async () => {
    const fetchStatus = vi.fn((id: string) =>
      id === 'realm-1' ? Promise.resolve(online(1)) : new Promise<RealmStatusResult>(() => {}),
    );
    const { rerender } = render(
      <RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={10_000} />,
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Online: 1 player'));
    rerender(<RealmStatus realmId="realm-2" fetchStatus={fetchStatus} intervalMs={10_000} />);
    expect(screen.getByRole('status')).toHaveTextContent('Checking status…');
  });

  it('pauses polling, and resuming checks right away', async () => {
    const user = userEvent.setup();
    const fetchStatus = vi.fn().mockResolvedValue(online(2));
    render(<RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={INTERVAL} />);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Online: 2 players'));

    await user.click(screen.getByRole('button', { name: 'Pause updates' }));
    const callsWhenPaused = fetchStatus.mock.calls.length;
    await wait(INTERVAL * 4);
    expect(fetchStatus.mock.calls.length).toBe(callsWhenPaused);

    await user.click(screen.getByRole('button', { name: 'Resume updates' }));
    expect(fetchStatus.mock.calls.length).toBe(callsWhenPaused + 1);
    expect(screen.getByRole('button', { name: 'Pause updates' })).toBeInTheDocument();
  });

  it('shows "Status unavailable" on error and recovers on the next poll', async () => {
    const fetchStatus = vi
      .fn()
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValue(online(4));
    render(<RealmStatus realmId="realm-1" fetchStatus={fetchStatus} intervalMs={INTERVAL} />);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Status unavailable'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Online: 4 players'), {
      timeout: 1000,
    });
  });
});
