// 1.1 Minecoin Bundle Picker. The spec is in README.md in this folder.
import { useState } from 'react';

export type Bundle = {
  id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  /** Price in integer US cents, e.g. 599 === $5.99 */
  priceCents: number;
};

export type PurchaseSelection = {
  bundleId: string;
  quantity: number;
};

export type BundlePickerProps = {
  bundles: Bundle[];
  onPurchase: (selection: PurchaseSelection) => void;
};

export const MAX_QUANTITY = 10;

export function BundlePicker({ bundles, onPurchase }: BundlePickerProps) {
  // TODO: build it!
  return <div>TODO: Minecoin bundle picker</div>;
}
