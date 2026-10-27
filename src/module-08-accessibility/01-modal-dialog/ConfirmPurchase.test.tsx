import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmPurchase } from './ConfirmPurchase';

function setup() {
  const onConfirm = vi.fn();
  const user = userEvent.setup();
  render(
    <main>
      <button type="button">Something else on the page</button>
      <ConfirmPurchase bundleName="Explorer Bundle" price="990 Minecoins" onConfirm={onConfirm} />
    </main>,
  );
  const trigger = () => screen.getByRole('button', { name: 'Buy Explorer Bundle' });
  const open = async () => {
    await user.click(trigger());
    return screen.getByRole('dialog');
  };
  return { user, onConfirm, trigger, open };
}

describe('8.1 ConfirmPurchase (an accessible modal dialog)', () => {
  it('has a trigger that says it opens a dialog, and no dialog until it is clicked', () => {
    const { trigger } = setup();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a labelled, described, modal dialog with a heading', async () => {
    const { open } = setup();
    const dialog = await open();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog', { name: 'Confirm purchase' })).toBe(dialog);
    expect(dialog).toHaveAccessibleDescription('Buy Explorer Bundle for 990 Minecoins?');
    expect(screen.getByRole('heading', { name: 'Confirm purchase', level: 2 })).toBeInTheDocument();
  });

  it('moves focus to "Cancel" (the safe choice) when it opens', async () => {
    const { open } = setup();
    await open();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('traps Tab inside the dialog, wrapping from the last element to the first', async () => {
    const { user, open } = setup();
    await open();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Buy now' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Terms of sale' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('traps Shift+Tab too, wrapping from the first element to the last', async () => {
    const { user, open } = setup();
    await open();
    await user.tab({ shift: true }); // Cancel -> Terms of sale
    expect(screen.getByRole('link', { name: 'Terms of sale' })).toHaveFocus();
    await user.tab({ shift: true }); // first -> wraps to last
    expect(screen.getByRole('button', { name: 'Buy now' })).toHaveFocus();
  });

  it('Escape closes it, returns focus to the trigger, and does not buy anything', async () => {
    const { user, open, trigger, onConfirm } = setup();
    await open();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('"Cancel" closes it and returns focus to the trigger', async () => {
    const { user, open, trigger, onConfirm } = setup();
    await open();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('"Buy now" confirms once, closes, and returns focus to the trigger', async () => {
    const { user, open, trigger, onConfirm } = setup();
    await open();
    await user.click(screen.getByRole('button', { name: 'Buy now' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).toHaveFocus();
  });
});
