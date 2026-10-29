import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MinecoinBalance } from './MinecoinBalance';
import { deferred, wait } from '../test-utils';

const SLOW_TICK = 60_000; // effectively "never ticks" during a test

describe('2.4 MinecoinBalance (bug hunt)', () => {
  it('shows a loading message, then the formatted balance', async () => {
    const fetchBalance = vi.fn().mockResolvedValue(1234);
    render(<MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />);
    expect(screen.getByText('Loading balance…')).toBeInTheDocument();
    expect(await screen.findByText('Balance: 1,234 Minecoins')).toBeInTheDocument();
    expect(fetchBalance).toHaveBeenCalledWith('alex');
  });

  it('fetches again when userId changes', async () => {
    const fetchBalance = vi.fn((id: string) => Promise.resolve(id === 'alex' ? 1234 : 500));
    const { rerender } = render(
      <MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />,
    );
    await screen.findByText('Balance: 1,234 Minecoins');
    rerender(<MinecoinBalance userId="steve" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />);
    expect(fetchBalance).toHaveBeenLastCalledWith('steve');
    expect(await screen.findByText('Balance: 500 Minecoins')).toBeInTheDocument();
  });

  it("never shows the previous user's balance when responses arrive out of order", async () => {
    const alex = deferred<number>();
    const fetchBalance = vi.fn((id: string) => (id === 'alex' ? alex.promise : Promise.resolve(500)));
    const { rerender } = render(
      <MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />,
    );
    rerender(<MinecoinBalance userId="steve" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />);
    await screen.findByText('Balance: 500 Minecoins');

    alex.resolve(9999); // alex's slow response finally lands
    await wait(20);
    expect(screen.getByText('Balance: 500 Minecoins')).toBeInTheDocument();
    expect(screen.queryByText(/9,999/)).not.toBeInTheDocument();
  });

  it('reformats immediately when the locale changes', async () => {
    const fetchBalance = vi.fn().mockResolvedValue(1234);
    const { rerender } = render(
      <MinecoinBalance userId="alex" fetchBalance={fetchBalance} locale="en-US" tickMs={SLOW_TICK} />,
    );
    await screen.findByText('Balance: 1,234 Minecoins');
    rerender(
      <MinecoinBalance userId="alex" fetchBalance={fetchBalance} locale="de-DE" tickMs={SLOW_TICK} />,
    );
    expect(screen.getByText('Balance: 1.234 Minecoins')).toBeInTheDocument();
  });

  it('refreshes when the window regains focus', async () => {
    const fetchBalance = vi.fn().mockResolvedValueOnce(1234).mockResolvedValue(1500);
    render(<MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />);
    await screen.findByText('Balance: 1,234 Minecoins');
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(await screen.findByText('Balance: 1,500 Minecoins')).toBeInTheDocument();
  });

  it('stops listening for focus after unmounting', async () => {
    const fetchBalance = vi.fn().mockResolvedValue(1234);
    const { unmount } = render(
      <MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />,
    );
    await screen.findByText('Balance: 1,234 Minecoins');
    unmount();
    const callsAtUnmount = fetchBalance.mock.calls.length;
    window.dispatchEvent(new Event('focus'));
    expect(fetchBalance.mock.calls.length).toBe(callsAtUnmount);
  });

  it('counts up every tick', async () => {
    const fetchBalance = vi.fn().mockResolvedValue(1234);
    render(<MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={30} />);
    await waitFor(() => expect(screen.getByText('Updated 3s ago')).toBeInTheDocument(), {
      timeout: 1500,
    });
  });

  it('clears its interval on unmount', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const fetchBalance = vi.fn().mockResolvedValue(1234);
    const { unmount } = render(
      <MinecoinBalance userId="alex" fetchBalance={fetchBalance} tickMs={SLOW_TICK} />,
    );
    await screen.findByText('Balance: 1,234 Minecoins');
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
