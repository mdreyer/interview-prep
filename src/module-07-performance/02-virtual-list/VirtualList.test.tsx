import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getVisibleRange, VirtualList } from './VirtualList';

interface Block {
  id: number;
  name: string;
}
const BLOCKS: Block[] = Array.from({ length: 10_000 }, (_, i) => ({ id: i + 1, name: `Block ${i + 1}` }));

function setup(props: { items?: Block[]; overscan?: number } = {}) {
  const renderItem = vi.fn((b: Block) => <span>{b.name}</span>);
  const ui = (items: Block[]) => (
    <VirtualList
      label="Blocks"
      items={items}
      itemHeight={30}
      height={300}
      overscan={props.overscan}
      getKey={(b) => b.id}
      renderItem={renderItem}
    />
  );
  const view = render(ui(props.items ?? BLOCKS));
  const list = () => screen.getByRole('list', { name: 'Blocks' });
  const rows = () => within(list()).queryAllByRole('listitem');
  const positions = () => rows().map((r) => Number(r.getAttribute('aria-posinset')));
  /** jsdom has no layout, so we set scrollTop by hand and fire the event, the way the browser would. */
  const scrollTo = (top: number) =>
    act(() => {
      Object.defineProperty(list(), 'scrollTop', { configurable: true, value: top });
      fireEvent.scroll(list());
    });
  return { list, rows, positions, scrollTo, renderItem, rerender: (items: Block[]) => view.rerender(ui(items)) };
}

describe('7.2 VirtualList', () => {
  it('getVisibleRange: visible rows plus overscan on each side, clamped to the list', () => {
    expect(getVisibleRange(10_000, 30, 300, 0, 3)).toEqual({ start: 0, end: 13 });
    expect(getVisibleRange(10_000, 30, 300, 3000, 3)).toEqual({ start: 97, end: 113 });
    expect(getVisibleRange(10_000, 30, 300, 299_700, 3)).toEqual({ start: 9987, end: 10_000 });
    expect(getVisibleRange(10_000, 30, 300, 45, 0)).toEqual({ start: 1, end: 12 });
  });

  it('renders only the visible rows plus overscan, not 10,000 of them', () => {
    const { rows, positions, renderItem } = setup();
    expect(rows()).toHaveLength(13);
    expect(positions()[0]).toBe(1);
    expect(screen.getByText('Block 1')).toBeInTheDocument();
    expect(screen.queryByText('Block 14')).toBeNull();
    expect(renderItem.mock.calls.length).toBeLessThanOrEqual(13);
  });

  it('is a scrollable box of the given height, with a spacer as tall as all the rows', () => {
    const { list } = setup();
    expect(list().style.height).toBe('300px');
    expect(list().style.overflowY).toBe('auto');
    expect((list().firstElementChild as HTMLElement).style.height).toBe('300000px');
  });

  it('renders a different window of rows when scrolled', async () => {
    const { scrollTo, rows, positions } = setup();
    await scrollTo(3000);
    expect(positions()[0]).toBe(98);
    expect(positions().at(-1)).toBe(113);
    expect(rows()).toHaveLength(16);
    expect(screen.getByText('Block 101')).toBeInTheDocument();
    expect(screen.queryByText('Block 1')).toBeNull();
  });

  it('positions each row where it would be in the full list', async () => {
    const { scrollTo, rows } = setup();
    await scrollTo(3000);
    const row101 = rows().find((r) => r.getAttribute('aria-posinset') === '101')!;
    const style = row101.style;
    expect(style.top === '3000px' || style.transform === 'translateY(3000px)').toBe(true);
  });

  it('tells assistive tech where each row sits in the whole list (aria-setsize / aria-posinset)', () => {
    const { rows } = setup();
    expect(rows()[0]).toHaveAttribute('aria-setsize', '10000');
    expect(rows()[0]).toHaveAttribute('aria-posinset', '1');
  });

  it('reaches the very last row at the bottom', async () => {
    const { scrollTo, positions } = setup();
    await scrollTo(299_700);
    expect(positions().at(-1)).toBe(10_000);
    expect(screen.getByText('Block 10000')).toBeInTheDocument();
  });

  it('respects overscan={0}', () => {
    const { rows } = setup({ overscan: 0 });
    expect(rows()).toHaveLength(10);
  });

  it('still shows rows when the list shrinks while scrolled far down (e.g. after filtering)', async () => {
    const { scrollTo, rerender, rows, list } = setup();
    await scrollTo(3000);
    rerender(BLOCKS.slice(0, 5));
    expect(rows()).toHaveLength(5);
    expect((list().firstElementChild as HTMLElement).style.height).toBe('150px');
  });
});
