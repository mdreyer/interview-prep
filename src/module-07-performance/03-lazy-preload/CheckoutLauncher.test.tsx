import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { CheckoutLauncher, lazyWithPreload, type CheckoutDialogProps, type DialogModule } from './CheckoutLauncher';

/** Stands in for the real (big) checkout chunk. */
function FakeCheckoutDialog({ onClose }: CheckoutDialogProps) {
  return (
    <div role="dialog" aria-label="Checkout">
      <h2>Checkout</h2>
      <label>
        Promo code <input />
      </label>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
const MODULE: DialogModule = { default: FakeCheckoutDialog };

/** Each loader call returns the next deferred "chunk download", which the test settles. */
function setup() {
  const downloads: ReturnType<typeof deferred<DialogModule>>[] = [];
  const loader = vi.fn(() => {
    const d = deferred<DialogModule>();
    d.promise.catch(() => {});
    downloads.push(d);
    return d.promise;
  });
  const user = userEvent.setup();
  const view = render(<CheckoutLauncher loadCheckoutDialog={loader} />);
  const arrive = (i = 0) => act(async () => downloads[i]!.resolve(MODULE));
  const fail = (i = 0) => act(async () => downloads[i]!.reject(new TypeError('Failed to fetch dynamically imported module')));
  return {
    user,
    loader,
    arrive,
    fail,
    buy: () => screen.getByRole('button', { name: 'Buy Minecoins' }),
    rerender: () => view.rerender(<CheckoutLauncher loadCheckoutDialog={loader} />),
  };
}

describe('7.3 Code-splitting: lazy checkout with preload and retry', () => {
  it('lazyWithPreload: preload() starts the download once, however often it is called', async () => {
    const loader = vi.fn(async () => MODULE);
    const Dialog = lazyWithPreload(loader);
    const a = Dialog.preload();
    const b = Dialog.preload();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    await expect(a).resolves.toBe(MODULE);
  });

  it("doesn't download the checkout chunk until it might be needed", () => {
    const { loader } = setup();
    expect(loader).not.toHaveBeenCalled();
  });

  it('starts downloading on hover, and clicking afterwards reuses that download', async () => {
    const { user, loader, buy, arrive } = setup();
    await user.hover(buy());
    expect(loader).toHaveBeenCalledTimes(1);
    await user.click(buy());
    await arrive();
    expect(await screen.findByRole('dialog', { name: 'Checkout' })).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('also preloads on keyboard focus', async () => {
    const { user, loader, buy } = setup();
    await user.tab();
    expect(buy()).toHaveFocus();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('shows "Loading checkout…" if the chunk is still downloading when the player clicks', async () => {
    const { user, buy, arrive } = setup();
    await user.click(buy());
    expect(screen.getByRole('status')).toHaveTextContent('Loading checkout…');
    await arrive();
    expect(await screen.findByRole('dialog', { name: 'Checkout' })).toBeInTheDocument();
    expect(screen.queryByText('Loading checkout…')).toBeNull();
  });

  it('closing and reopening reuses the loaded chunk', async () => {
    const { user, buy, arrive, loader } = setup();
    await user.click(buy());
    await arrive();
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(buy());
    expect(await screen.findByRole('dialog', { name: 'Checkout' })).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("re-rendering the launcher doesn't remount the open dialog (the lazy component isn't recreated on render)", async () => {
    const { user, buy, arrive, rerender, loader } = setup();
    await user.click(buy());
    await arrive();
    const promo = await screen.findByRole('textbox', { name: 'Promo code' });
    await user.type(promo, 'CREEPER10');
    rerender();
    expect(screen.getByRole('textbox', { name: 'Promo code' })).toHaveValue('CREEPER10');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('when the chunk fails to download (a deploy replaced it), shows an alert, and "Try again" downloads it again', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user, buy, fail, arrive, loader } = setup();
    await user.click(buy());
    await fail(0);
    expect(await screen.findByRole('alert')).toHaveTextContent("Checkout couldn't load.");

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(loader).toHaveBeenCalledTimes(2);
    await arrive(1);
    expect(await screen.findByRole('dialog', { name: 'Checkout' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    spy.mockRestore();
  });
});
