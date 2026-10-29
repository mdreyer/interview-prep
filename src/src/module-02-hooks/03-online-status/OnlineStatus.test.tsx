import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PurchaseButton, useOnlineStatus } from './OnlineStatus';

const OFFLINE_MESSAGE = "You're offline. Reconnect to complete your purchase.";

/** Pretend the browser's connection changed: update navigator.onLine and fire the matching event. */
function setOnline(online: boolean, { fireEvent = true } = {}) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => online });
  if (fireEvent) {
    act(() => {
      window.dispatchEvent(new Event(online ? 'online' : 'offline'));
    });
  }
}

afterEach(() => {
  // Remove our override so navigator.onLine goes back to the real (online) value.
  delete (window.navigator as unknown as Record<string, unknown>).onLine;
});

describe('2.3 useOnlineStatus', () => {
  it('is correct on the very first render', () => {
    setOnline(false, { fireEvent: false });
    const values: boolean[] = [];
    renderHook(() => {
      const online = useOnlineStatus();
      values.push(online);
      return online;
    });
    expect(values[0]).toBe(false);
    expect(values).not.toContain(true);
  });

  it('updates on offline and online events', () => {
    setOnline(true, { fireEvent: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    setOnline(false);
    expect(result.current).toBe(false);
    setOnline(true);
    expect(result.current).toBe(true);
  });

  it('removes its listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    const removed = removeSpy.mock.calls.map((call) => call[0]);
    expect(removed).toContain('online');
    expect(removed).toContain('offline');
    removeSpy.mockRestore();
  });
});

describe('2.3 PurchaseButton', () => {
  it('works normally while online, with an empty status region', async () => {
    setOnline(true, { fireEvent: false });
    const onPurchase = vi.fn();
    const user = userEvent.setup();
    render(<PurchaseButton onPurchase={onPurchase} />);
    const button = screen.getByRole('button', { name: 'Complete purchase' });
    expect(button).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent(/^$/);
    await user.click(button);
    expect(onPurchase).toHaveBeenCalledTimes(1);
  });

  it('disables the button and explains why while offline', async () => {
    setOnline(true, { fireEvent: false });
    const onPurchase = vi.fn();
    const user = userEvent.setup();
    render(<PurchaseButton onPurchase={onPurchase} />);
    const status = screen.getByRole('status');

    setOnline(false);
    const button = screen.getByRole('button', { name: 'Complete purchase' });
    expect(button).toBeDisabled();
    expect(status).toHaveTextContent(OFFLINE_MESSAGE);
    await user.click(button);
    expect(onPurchase).not.toHaveBeenCalled();

    setOnline(true);
    expect(button).toBeEnabled();
    expect(screen.getByRole('status')).toBe(status);
    expect(status).not.toHaveTextContent(OFFLINE_MESSAGE);
  });

  it('starts disabled when the page loads offline', () => {
    setOnline(false, { fireEvent: false });
    render(<PurchaseButton onPurchase={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Complete purchase' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(OFFLINE_MESSAGE);
  });
});
