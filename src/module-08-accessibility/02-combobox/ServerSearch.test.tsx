import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ServerSearch } from './ServerSearch';

const SERVERS = ['Skyblock Isles', 'Creative Plots', 'Parkour Peak', 'Hypixel-ish Minigames', 'Survival Island', 'Bedwars Arena'];

function setup() {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(<ServerSearch servers={SERVERS} onSelect={onSelect} />);
  const input = () => screen.getByRole('combobox', { name: 'Server' });
  const listbox = () => screen.queryByRole('listbox', { name: 'Servers' });
  const options = () => (listbox() ? within(listbox()!).getAllByRole('option') : []);
  const active = () => {
    const id = input().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id) : null;
  };
  return { user, onSelect, input, listbox, options, active };
}

describe('8.2 ServerSearch (the ARIA combobox pattern)', () => {
  it('is a labelled combobox that starts collapsed and points at its listbox', () => {
    const { input, listbox } = setup();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveAttribute('aria-autocomplete', 'list');
    expect(input().getAttribute('aria-controls')).toBeTruthy();
    expect(listbox()).toBeNull();
  });

  it('typing filters the options (case-insensitive) and expands, without picking an option yet', async () => {
    const { user, input, options, listbox, active } = setup();
    await user.type(input(), 'IS');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(listbox()!.id).toBe(input().getAttribute('aria-controls'));
    expect(options().map((o) => o.textContent)).toEqual(['Skyblock Isles', 'Hypixel-ish Minigames', 'Survival Island']);
    expect(active()).toBeNull();
    expect(input()).toHaveFocus();
  });

  it('ArrowDown/ArrowUp move the active option via aria-activedescendant (focus stays in the input), wrapping at the ends', async () => {
    const { user, input, active, options } = setup();
    await user.type(input(), 'is');
    await user.keyboard('{ArrowDown}');
    expect(active()).toHaveTextContent('Skyblock Isles');
    expect(active()).toHaveAttribute('aria-selected', 'true');
    expect(options().filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toHaveTextContent('Survival Island');
    await user.keyboard('{ArrowDown}');
    expect(active()).toHaveTextContent('Skyblock Isles');
    await user.keyboard('{ArrowUp}');
    expect(active()).toHaveTextContent('Survival Island');
    expect(input()).toHaveFocus();
  });

  it('ArrowDown on a collapsed, empty box opens every option and activates the first', async () => {
    const { user, input, options, active } = setup();
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(options()).toHaveLength(SERVERS.length);
    expect(active()).toHaveTextContent('Skyblock Isles');
  });

  it('Enter picks the active option: fills the input, collapses, and calls onSelect', async () => {
    const { user, input, onSelect, listbox } = setup();
    await user.type(input(), 'p');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('Parkour Peak');
    expect(input()).toHaveValue('Parkour Peak');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(listbox()).toBeNull();
    expect(input()).not.toHaveAttribute('aria-activedescendant');
  });

  it('clicking an option picks it', async () => {
    const { user, input, onSelect } = setup();
    await user.type(input(), 'bed');
    await user.click(screen.getByRole('option', { name: 'Bedwars Arena' }));
    expect(onSelect).toHaveBeenCalledWith('Bedwars Arena');
    expect(input()).toHaveValue('Bedwars Arena');
  });

  it('Escape collapses first (keeping the text), and a second Escape clears the text', async () => {
    const { user, input } = setup();
    await user.type(input(), 'sky');
    await user.keyboard('{Escape}');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveValue('sky');
    await user.keyboard('{Escape}');
    expect(input()).toHaveValue('');
  });

  it('announces the number of results in a status region, singular and plural, and "No servers found"', async () => {
    const { user, input, onSelect } = setup();
    await user.type(input(), 'i');
    expect(screen.getByRole('status')).toHaveTextContent('4 servers found');
    await user.type(input(), 'sland');
    expect(screen.getByRole('status')).toHaveTextContent('1 server found');
    await user.type(input(), 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('No servers found');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
