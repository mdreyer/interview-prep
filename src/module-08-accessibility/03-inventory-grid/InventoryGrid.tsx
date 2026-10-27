// 8.3 InventoryGrid. The spec is in README.md in this folder.
import { useRef, useState, type KeyboardEvent } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
}

export function InventoryGrid({
  slots,
  columns = 9,
  onSelect,
}: {
  slots: (InventoryItem | null)[];
  columns?: number;
  onSelect: (slotIndex: number) => void;
}) {
  // TODO: this renders the slots, but it isn't a grid and you can't use it with a keyboard.
  return (
    <div>
      {slots.map((item, index) => (
        <div key={index} onClick={() => onSelect(index)}>
          {item ? `${item.name} (${item.count})` : 'Empty slot'}
        </div>
      ))}
    </div>
  );
}
