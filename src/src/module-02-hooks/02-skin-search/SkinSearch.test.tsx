import { render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SkinSearch, useDebouncedValue, type Skin } from './SkinSearch';
import { filterSkins } from './skins.fixture';
import { deferred, wait } from '../test-utils';

const DEBOUNCE = 150;

/** A fake API that resolves right away and rejects with an AbortError if aborted first. */
function fakeApi() {
  return vi.fn((query: string, signal: AbortSignal) => {
    return new Promise<Skin[]>((resolve, reject) => {
      if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      setTimeout(() => resolve(filterSkins(query)), 5);
    });
  });
}

function setup(searchSkins = fakeApi()) {
  const user = userEvent.setup();
  render(<SkinSearch searchSkins={searchSkins} debounceMs={DEBOUNCE} />);
  const input = screen.getByRole('searchbox', { name: 'Search skins' });
  return { user, input, searchSkins };
}

const status = () => screen.getByRole('status');

describe('2.2 useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('steve', 100));
    expect(result.current).toBe('steve');
  });

  it('only updates after the value has stayed the same for the delay', async () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 250), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'ab' });
    await wait(150);
    rerender({ v: 'abc' }); // restarts the timer
    await wait(150);
    expect(result.current).toBe('a'); // 300ms since the first change, but only 150ms since the last
    await waitFor(() => expect(result.current).toBe('abc'));
  });
});

describe('2.2 SkinSearch', () => {
  it('prompts for input and does not search for an empty or whitespace query', async () => {
    const { user, input, searchSkins } = setup();
    expect(status()).toHaveTextContent('Type to search skins.');
    await user.type(input, '   ');
    await wait(DEBOUNCE * 2);
    expect(searchSkins).not.toHaveBeenCalled();
    expect(status()).toHaveTextContent('Type to search skins.');
  });

  it('debounces typing into a single trimmed request', async () => {
    const { user, input, searchSkins } = setup();
    await user.type(input, ' creeper ');
    await waitFor(() => expect(searchSkins).toHaveBeenCalledTimes(1));
    expect(searchSkins.mock.calls[0]![0]).toBe('creeper');
    await wait(DEBOUNCE * 2);
    expect(searchSkins).toHaveBeenCalledTimes(1);
  });

  it('shows "Searching…" while in flight, then results and a count', async () => {
    const pending = deferred<Skin[]>();
    const searchSkins = vi.fn(() => pending.promise);
    const { user, input } = setup(searchSkins);
    await user.type(input, 'creeper');
    await waitFor(() => expect(status()).toHaveTextContent('Searching…'));
    expect(screen.queryByRole('list', { name: 'Search results' })).not.toBeInTheDocument();

    pending.resolve(filterSkins('creeper'));
    await waitFor(() => expect(status()).toHaveTextContent('2 skins found'));
    const items = within(screen.getByRole('list', { name: 'Search results' })).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Creeper Hoodie by BlockWear');
  });

  it('uses the singular for one result and handles no results', async () => {
    const { user, input } = setup();
    await user.type(input, 'axolotl');
    await waitFor(() => expect(status()).toHaveTextContent('1 skin found'));

    await user.clear(input);
    await user.type(input, 'herobrine');
    await waitFor(() => expect(status()).toHaveTextContent('No skins found for "herobrine".'));
    expect(screen.queryByRole('list', { name: 'Search results' })).not.toBeInTheDocument();
  });

  it('aborts the in-flight request when the query changes, without showing an error', async () => {
    const signals: AbortSignal[] = [];
    const first = deferred<Skin[]>();
    const searchSkins = vi.fn((query: string, signal: AbortSignal) => {
      signals.push(signal);
      return query === 'creeper' ? first.promise : Promise.resolve(filterSkins(query));
    });
    const { user, input } = setup(searchSkins);

    await user.type(input, 'creeper');
    await waitFor(() => expect(searchSkins).toHaveBeenCalledTimes(1));
    await user.clear(input);
    await user.type(input, 'ender');
    await waitFor(() => expect(searchSkins).toHaveBeenCalledTimes(2));

    expect(signals[0]!.aborted).toBe(true);
    expect(signals[1]!.aborted).toBe(false);
    await waitFor(() => expect(status()).toHaveTextContent('1 skin found'));
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('never shows a stale response, even if the old request ignores the abort', async () => {
    const slowCreeper = deferred<Skin[]>();
    const searchSkins = vi.fn((query: string) =>
      query === 'creeper' ? slowCreeper.promise : Promise.resolve(filterSkins(query)),
    );
    const { user, input } = setup(searchSkins);

    await user.type(input, 'creeper');
    await waitFor(() => expect(searchSkins).toHaveBeenCalledTimes(1));
    await user.clear(input);
    await user.type(input, 'axolotl');
    await waitFor(() => expect(status()).toHaveTextContent('1 skin found'));

    slowCreeper.resolve(filterSkins('creeper')); // arrives late, out of order
    await wait(20);
    expect(status()).toHaveTextContent('1 skin found');
    expect(screen.getByRole('listitem')).toHaveTextContent('Axolotl Onesie');
  });

  it('shows an error with a Try again button that re-runs the query', async () => {
    const searchSkins = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockImplementation((query: string) => Promise.resolve(filterSkins(query)));
    const { user, input } = setup(searchSkins);

    await user.type(input, 'enderman');
    await waitFor(() => expect(status()).toHaveTextContent('Something went wrong.'));
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(status()).toHaveTextContent('1 skin found'));
    expect(searchSkins).toHaveBeenCalledTimes(2);
    expect(searchSkins.mock.calls[1]![0]).toBe('enderman');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('aborts the in-flight request on unmount', async () => {
    let signal: AbortSignal | undefined;
    const searchSkins = vi.fn((_q: string, s: AbortSignal) => {
      signal = s;
      return new Promise<Skin[]>(() => {});
    });
    const user = userEvent.setup();
    const { unmount } = render(<SkinSearch searchSkins={searchSkins} debounceMs={DEBOUNCE} />);
    await user.type(screen.getByRole('searchbox', { name: 'Search skins' }), 'creeper');
    await waitFor(() => expect(searchSkins).toHaveBeenCalled());
    unmount();
    expect(signal!.aborted).toBe(true);
  });
});
