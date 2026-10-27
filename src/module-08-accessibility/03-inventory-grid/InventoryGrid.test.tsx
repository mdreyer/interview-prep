import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InventoryGrid, type InventoryItem } from './InventoryGrid';

const item = (name: string, count: number): InventoryItem => ({ id: name.toLowerCase().replace(/\s/g, '-'), name, count });

// 3 rows of 9, like the Minecraft inventory. A few slots are empty (null).
const SLOTS: (InventoryItem | null)[] = Array.from({ length: 27 }, (_, i) => null);
SLOTS[0] = item('Oak Planks', 64);
SLOTS[1] = item('Torch', 32);
SLOTS[8] = item('Diamond', 3);
SLOTS[9] = item('Cobblestone', 64);
SLOTS[17] = item('Bread', 12);
SLOTS[18] = item('Iron Pickaxe', 1);
SLOTS[26] = item('Ender Pearl', 16);

function setup() {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(
    <>
      <button type="button">Before</button>
      <InventoryGrid slots={SLOTS} onSelect={onSelect} />
      <button type="button">After</button>
    </>,
  );
  const cells = () => within(screen.getByRole('grid', { name: 'Inventory' })).getAllByRole('gridcell');
  const cell = (i: number) => cells()[i]!;
  const focused = () => cells().indexOf(document.activeElement as HTMLElement);
  const enterGrid = async () => {
    await user.click(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
  };
  return { user, onSelect, cells, cell, focused, enterGrid };
}

describe('8.3 InventoryGrid (roving tabindex in a grid)', () => {
  it('is a labelled grid of 3 rows × 9 cells, with item names, counts, and "Empty slot"', () => {
    const { cells } = setup();
    expect(within(screen.getByRole('grid', { name: 'Inventory' })).getAllByRole('row')).toHaveLength(3);
    expect(cells()).toHaveLength(27);
    expect(cells()[0]).toHaveTextContent('Oak Planks (64)');
    expect(cells()[2]).toHaveTextContent('Empty slot');
  });

  it('is ONE tab stop: Tab enters on the first cell, and the next Tab leaves the grid', async () => {
    const { user, cells, cell, enterGrid } = setup();
    expect(cells().filter((c) => c.tabIndex === 0)).toHaveLength(1);
    await enterGrid();
    expect(cell(0)).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('ArrowRight / ArrowLeft move along the row, and stop at the row edges', async () => {
    const { user, focused, enterGrid } = setup();
    await enterGrid();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(focused()).toBe(2);
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(focused()).toBe(0);
    await user.keyboard('{End}{ArrowRight}');
    expect(focused()).toBe(8);
  });

  it('ArrowDown / ArrowUp move between rows in the same column, and stop at the top and bottom', async () => {
    const { user, focused, enterGrid } = setup();
    await enterGrid();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(focused()).toBe(10);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(19);
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(focused()).toBe(1);
  });

  it('Home / End jump to the start / end of the current row', async () => {
    const { user, focused, enterGrid } = setup();
    await enterGrid();
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}{End}');
    expect(focused()).toBe(17);
    await user.keyboard('{Home}');
    expect(focused()).toBe(9);
  });

  it('remembers where you were: Tab out and back in returns to the same cell', async () => {
    const { user, cell, cells, enterGrid } = setup();
    await enterGrid();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(cells().filter((c) => c.tabIndex === 0)).toEqual([cell(10)]);
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(cell(10)).toHaveFocus();
  });

  it('Enter or Space selects the focused slot (aria-selected) and calls onSelect', async () => {
    const { user, cell, cells, onSelect, enterGrid } = setup();
    await enterGrid();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(cell(1)).toHaveAttribute('aria-selected', 'true');
    expect(onSelect).toHaveBeenLastCalledWith(1);
    await user.keyboard('{ArrowDown}{ArrowLeft} ');
    expect(cell(9)).toHaveAttribute('aria-selected', 'true');
    expect(cell(1)).toHaveAttribute('aria-selected', 'false');
    expect(cells().filter((c) => c.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    expect(onSelect).toHaveBeenLastCalledWith(9);
  });

  it('clicking a slot focuses and selects it, and makes it the tab stop', async () => {
    const { user, cell, cells, onSelect } = setup();
    await user.click(cell(26));
    expect(cell(26)).toHaveFocus();
    expect(cell(26)).toHaveAttribute('aria-selected', 'true');
    expect(onSelect).toHaveBeenCalledWith(26);
    expect(cells().filter((c) => c.tabIndex === 0)).toEqual([cell(26)]);
  });
});
