// 8.1 ConfirmPurchase. The spec is in README.md in this folder.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export function ConfirmPurchase({ bundleName, price, onConfirm }: { bundleName: string; price: string; onConfirm: () => void }) {
  // TODO: build it! (No dialog libraries, and no native <dialog> this time: build the behavior yourself.)
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Buy {bundleName}
      </button>
      {open && (
        <div>
          <h2>Confirm purchase</h2>
          <p>
            Buy {bundleName} for {price}?
          </p>
          <a href="/terms-of-sale">Terms of sale</a>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm}>
            Buy now
          </button>
        </div>
      )}
    </>
  );
}
