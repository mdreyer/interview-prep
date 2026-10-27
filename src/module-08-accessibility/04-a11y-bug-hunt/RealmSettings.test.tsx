import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RealmSettings } from './RealmSettings';

function setup(initial = { name: 'Skyblock Isles', allowCheats: false }) {
  const onSave = vi.fn();
  const onClose = vi.fn();
  const user = userEvent.setup();
  const { container } = render(<RealmSettings initial={initial} thumbnailUrl="/realms/skyblock.png" onSave={onSave} onClose={onClose} />);
  const nameInput = () => screen.getByRole('textbox', { name: 'Realm name' });
  const cheats = () => screen.queryByRole('switch', { name: 'Allow cheats' }) ?? screen.getByRole('checkbox', { name: 'Allow cheats' });
  const saveButton = () => screen.getByRole('button', { name: 'Save settings' });
  return { user, onSave, onClose, container, nameInput, cheats, saveButton };
}

describe('8.4 Bug hunt: Realm settings', () => {
  it('the icon-only close button has an accessible name', async () => {
    const { user, onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('the realm thumbnail has alt text', () => {
    setup();
    expect(screen.getByRole('img', { name: 'Skyblock Isles thumbnail' })).toBeInTheDocument();
  });

  it("headings don't skip levels", () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Realm settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'General' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 4 })).toBeNull();
  });

  it('the name field has a real label, and nothing uses a positive tabIndex', () => {
    const { nameInput, container } = setup();
    expect(nameInput()).toHaveValue('Skyblock Isles');
    const positive = Array.from(container.querySelectorAll<HTMLElement>('[tabindex]')).filter((el) => el.tabIndex > 0);
    expect(positive).toHaveLength(0);
  });

  it('"Allow cheats" is a real toggle: a focusable checkbox or switch whose checked state changes', async () => {
    const { user, cheats } = setup();
    expect(cheats()).not.toBeChecked();
    expect(cheats().tabIndex).toBeGreaterThanOrEqual(0);
    await user.click(cheats());
    expect(cheats()).toBeChecked();
  });

  it('"Save settings" is a real button: it works from the keyboard', async () => {
    const { user, saveButton, onSave } = setup();
    await act(async () => saveButton().focus());
    expect(saveButton()).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSave).toHaveBeenCalledWith({ name: 'Skyblock Isles', allowCheats: false });
  });

  it('an empty name shows a text error, connected to the field, not just a red border', async () => {
    const { user, nameInput, saveButton, onSave } = setup();
    await user.clear(nameInput());
    await user.click(saveButton());
    expect(onSave).not.toHaveBeenCalled();
    expect(nameInput()).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput()).toHaveAccessibleDescription('Enter a realm name.');
  });

  it('"Settings saved" is announced through a status region that was already in the page', async () => {
    const { user, saveButton, cheats, onSave } = setup();
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('');
    await user.click(cheats());
    await user.click(saveButton());
    expect(onSave).toHaveBeenCalledWith({ name: 'Skyblock Isles', allowCheats: true });
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Settings saved');
  });
});
