// 6.1 RedeemCodeForm. The spec is in README.md in this folder.
import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';

export type RedeemResult =
  | { ok: true; itemName: string }
  | { ok: false; reason: 'already-redeemed' | 'not-found' | 'expired' };

/** "  abcde-12345 fghij " -> "ABCDE12345FGHIJ" */
export function normalizeCode(raw: string): string {
  // TODO
  return raw;
}

export function RedeemCodeForm({ redeemCode }: { redeemCode: (code: string) => Promise<RedeemResult> }) {
  // TODO: build it with useActionState, <form action={...}>, and a child component that calls useFormStatus.
  return <form>TODO: redeem code form</form>;
}
