// 8.2 ServerSearch. The spec is in README.md in this folder.
import { useId, useState, type KeyboardEvent } from 'react';

export function ServerSearch({ servers, onSelect }: { servers: string[]; onSelect: (server: string) => void }) {
  // TODO: build it!
  return (
    <div>
      <label>
        Server <input />
      </label>
    </div>
  );
}
