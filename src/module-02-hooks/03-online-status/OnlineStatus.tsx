// 2.3 Offline-aware purchase button. The spec is in README.md in this folder.
import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);

  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

const getSnapshot = () => window.navigator.onLine;
const getServerSnapshot = () => true;

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type PurchaseButtonProps = {
  onPurchase: () => void;
};

export function PurchaseButton({ onPurchase }: PurchaseButtonProps) {
  const online = useOnlineStatus();

  return (
    <div>
      <button type="button" disabled={!online} onClick={onPurchase}>
        Complete purchase
      </button>
      <p role="status">
        {online ? '' : "You're offline. Reconnect to complete your purchase."}
      </p>
    </div>
  );
}
