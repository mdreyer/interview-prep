// 7.2 VirtualList. The spec is in README.md in this folder.
import { useState, type Key, type ReactNode } from 'react';

export interface VirtualListProps<T> {
  items: readonly T[];
  /** Every row is exactly this tall (px). */
  itemHeight: number;
  /** The scrollable box is this tall (px). */
  height: number;
  /** Extra rows to render above and below the visible ones. Default 3. */
  overscan?: number;
  label: string;
  getKey: (item: T, index: number) => Key;
  renderItem: (item: T, index: number) => ReactNode;
}

/** Which rows to render: indexes from `start` (inclusive) to `end` (exclusive). */
export function getVisibleRange(count: number, itemHeight: number, height: number, scrollTop: number, overscan: number) {
  // TODO
  return { start: 0, end: count };
}

export function VirtualList<T>({ items, itemHeight, height, overscan = 3, label, getKey, renderItem }: VirtualListProps<T>) {
  // TODO: this renders every row. Make it render only the visible ones.
  return (
    <div role="list" aria-label={label}>
      {items.map((item, index) => (
        <div key={getKey(item, index)} role="listitem">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
