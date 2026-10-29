// 2.4 Bug Hunt (effects edition). This component has 6 bugs. The spec is in README.md in this folder.
import { useEffect, useState } from 'react';

export type MinecoinBalanceProps = {
  userId: string;
  fetchBalance: (userId: string) => Promise<number>;
  locale?: string;
  tickMs?: number;
};

export function MinecoinBalance({
  userId,
  fetchBalance,
  locale = 'en-US',
  tickMs = 1000,
}: MinecoinBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Refresh when the player comes back to this tab
  // FIX: combine useEffects that fetch the same data
  // FIX: remove event listener on next focus
  useEffect(() => {
    let canceled = false;

    const load = () => {
      fetchBalance(userId).then((value) => {
        if (canceled) return;
        setBalance(value);
        setSecondsAgo(0);
      });
    };

    load();
    window.addEventListener('focus', load);

    return () => {
      canceled = true;
      window.removeEventListener('focus', load);
    };
  }, [userId, fetchBalance]);

  // "Updated Ns ago" ticker
  // FIX: use functional set state to grab prev state value
  // FIX: reset interval when balance changes
  useEffect(() => {
    setSecondsAgo(0);

    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, tickMs);

    return () => clearInterval(interval);
  }, [tickMs]);

  // Format balance for display
  // FIX: formatted does not need to be in state
  const formatted =
    balance === null ? '' : new Intl.NumberFormat(locale).format(balance);

  return (
    <section>
      <h2>Minecoin balance</h2>
      <p>
        {balance === null
          ? 'Loading balance…'
          : `Balance: ${formatted} Minecoins`}
      </p>
      <p>Updated {secondsAgo}s ago</p>
    </section>
  );
}
