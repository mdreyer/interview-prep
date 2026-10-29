// 2.1 Realm Status Poller. The spec is in README.md in this folder.
import { useEffect, useRef, useState } from 'react';

export type RealmStatusResult = {
  online: boolean;
  playerCount: number;
};

export type RealmStatusProps = {
  realmId: string;
  fetchStatus: (realmId: string) => Promise<RealmStatusResult>;
  intervalMs?: number;
};

type StatusSnapshot =
  | { realmId: string; kind: 'ok'; resp: RealmStatusResult }
  | { realmId: string; kind: 'error' };

export function RealmStatus({
  realmId,
  fetchStatus,
  intervalMs = 15000,
}: RealmStatusProps) {
  const [isPolling, setIsPolling] = useState(true);
  const [status, setStatus] = useState<StatusSnapshot>();

  const getStatus = () => {
    if (!status || realmId !== status.realmId) {
      return 'Checking status…';
    }

    if (status.kind === 'error') return 'Status unavailable';

    const { online, playerCount } = status.resp;

    if (!online) return 'Offline';

    return playerCount === 1
      ? `Online: 1 player`
      : `Online: ${playerCount} players`;
  };

  const onTogglePolling = () => {
    setIsPolling((prev) => !prev);
  };

  useEffect(() => {
    if (!isPolling) return;
    let timeout: number | undefined;
    let canceled = false;

    const check = async () => {
      try {
        const resp = await fetchStatus(realmId);
        if (!canceled) setStatus({ realmId, resp, kind: 'ok' });
      } catch {
        if (!canceled) setStatus({ realmId, kind: 'error' });
      }

      if (!canceled) timeout = setTimeout(check, intervalMs);
    };

    check();

    return () => {
      canceled = true;
      clearTimeout(timeout);
    };
  }, [isPolling, realmId, fetchStatus, intervalMs]);

  return (
    <div>
      <p role="status">{getStatus()}</p>
      <button type="button" onClick={onTogglePolling}>
        {isPolling ? 'Pause updates' : 'Resume updates'}
      </button>
    </div>
  );
}
