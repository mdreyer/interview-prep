// 2.2 Skin Search. The spec is in README.md in this folder.
import { useEffect, useCallback, useState, useId } from 'react';

export type Skin = {
  id: string;
  name: string;
  creator: string;
};

export type SkinSearchProps = {
  searchSkins: (query: string, signal: AbortSignal) => Promise<Skin[]>;
  debounceMs?: number;
};

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedVal, setDebouncedVal] = useState(value);

  useEffect(() => {
    if (debouncedVal === value) return;

    const timeout = setTimeout(() => {
      setDebouncedVal(value);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [debouncedVal, value, delayMs]);

  return debouncedVal;
}

type SkinsSnapshot =
  | { query: string; skins: Skin[]; kind: 'ok' }
  | { query: string; kind: 'error' };

export function SkinSearch({ searchSkins, debounceMs = 300 }: SkinSearchProps) {
  const compId = useId();
  const [input, setInput] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [skinsSnap, setSkinsSnap] = useState<SkinsSnapshot>();
  const debouncedQuery = useDebouncedValue(input.trim(), debounceMs);

  const getStatus = () => {
    if (!input.trim()) return 'Type to search skins.';

    if (!skinsSnap || debouncedQuery !== skinsSnap.query) return 'Searching…';

    switch (skinsSnap.kind) {
      case 'ok':
        return !skinsSnap.skins.length
          ? `No skins found for "${input}".`
          : skinsSnap.skins.length === 1
          ? '1 skin found'
          : `${skinsSnap.skins.length} skins found`;
      case 'error':
        return 'Something went wrong.';
    }
  };

  const renderSkins = () => {
    if (!skinsSnap || !debouncedQuery) return null;

    if (skinsSnap.kind === 'ok') {
      return skinsSnap.skins.length ? (
        <ul aria-label="Search results">
          {skinsSnap.skins.map((skin) => (
            <li key={skin.id}>{`${skin.name} by ${skin.creator}`}</li>
          ))}
        </ul>
      ) : null;
    }

    if (skinsSnap.kind === 'error') {
      return (
        <button type="button" onClick={() => setAttempt((prev) => prev + 1)}>
          Try again
        </button>
      );
    }
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (!debouncedQuery) return;

    let canceled = false;

    const ac = new AbortController();

    const request = async () => {
      try {
        const resp = await searchSkins(debouncedQuery, ac.signal);
        if (!canceled)
          setSkinsSnap({ query: debouncedQuery, skins: resp, kind: 'ok' });
      } catch {
        if (!canceled) setSkinsSnap({ query: debouncedQuery, kind: 'error' });
      }
    };

    request();

    return () => {
      canceled = true;
      ac.abort();
    };
  }, [debouncedQuery, searchSkins, attempt]);

  return (
    <div>
      <p>
        <label htmlFor={`${compId}-search`}>Search skins</label>
        <input
          type="search"
          id={`${compId}-search`}
          onChange={onSearch}
          value={input}
        />
      </p>
      <p role="status">{getStatus()}</p>
      {renderSkins()}
    </div>
  );
}
