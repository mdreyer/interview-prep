import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { WishlistButton } from './WishlistButton';

/** Each call to setWishlisted returns the next deferred, so the test decides when (and how) each request finishes. */
function setup(initialWishlisted = false) {
  const requests: ReturnType<typeof deferred<void>>[] = [];
  const setWishlisted = vi.fn((_id: string, _value: boolean) => {
    const d = deferred<void>();
    requests.push(d);
    return d.promise;
  });
  const user = userEvent.setup();
  render(
    <WishlistButton itemId="skin-creeper-hoodie" itemName="Creeper Hoodie" initialWishlisted={initialWishlisted} setWishlisted={setWishlisted} />,
  );
  const button = () => screen.getByRole('button', { name: 'Wishlist Creeper Hoodie' });
  const settle = async (i: number, ok: boolean) => {
    await act(async () => {
      if (ok) requests[i]!.resolve();
      else requests[i]!.reject(new Error('503'));
      await Promise.resolve();
    });
  };
  return { user, setWishlisted, button, settle };
}

describe('5.4 WishlistButton (optimistic UI)', () => {
  it('is a toggle button with a fixed name; state comes from aria-pressed', () => {
    const { button } = setup(true);
    expect(button()).toHaveAttribute('aria-pressed', 'true');
  });

  it('flips immediately, before the server answers, and sends the new value', async () => {
    const { user, button, setWishlisted } = setup(false);
    await user.click(button());
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(setWishlisted).toHaveBeenCalledWith('skin-creeper-hoodie', true);
  });

  it('stays flipped when the server confirms', async () => {
    const { user, button, settle } = setup(false);
    await user.click(button());
    await settle(0, true);
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('rolls back and explains when the server fails', async () => {
    const { user, button, settle } = setup(false);
    await user.click(button());
    await settle(0, false);
    expect(button()).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't update your wishlist. Try again.");
  });

  it('clears the error on the next click', async () => {
    const { user, button, settle } = setup(false);
    await user.click(button());
    await settle(0, false);
    await user.click(button());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(button()).toHaveAttribute('aria-pressed', 'true');
  });

  it("doesn't block rapid clicks: each click flips the UI and sends its own request", async () => {
    const { user, button, setWishlisted } = setup(false);
    await user.click(button());
    await user.click(button());
    await user.click(button());
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(setWishlisted.mock.calls.map((c) => c[1])).toEqual([true, false, true]);
  });

  it('ignores a stale failure: an older request failing after a newer one was sent changes nothing', async () => {
    const { user, button, settle } = setup(false);
    await user.click(button()); // request 0: true
    await user.click(button()); // request 1: false
    await settle(1, true);
    await settle(0, false); // arrives late
    expect(button()).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('rolls back to the last value the server confirmed, not just "the opposite of what I clicked"', async () => {
    const { user, button, settle } = setup(false);
    await user.click(button()); // request 0: true
    await settle(0, true); // the server now says true
    await user.click(button()); // request 1: false
    await user.click(button()); // request 2: true
    await settle(1, false); // stale failure: ignored
    await settle(2, false); // the latest fails -> back to the last confirmed value
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('a stale *success* still counts as what the server last confirmed', async () => {
    const { user, button, settle } = setup(false);
    await user.click(button()); // request 0: true
    await user.click(button()); // request 1: false
    await settle(0, true); // late, but the server did save true
    await settle(1, false); // the latest fails -> the server is at true
    expect(button()).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
