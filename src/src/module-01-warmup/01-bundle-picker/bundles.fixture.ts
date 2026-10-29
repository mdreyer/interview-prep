import type { Bundle } from './BundlePicker';

export const BUNDLES: Bundle[] = [
  { id: 'starter', name: 'Starter Stack', coins: 320, bonusCoins: 0, priceCents: 199 },
  { id: 'explorer', name: 'Explorer Pack', coins: 1000, bonusCoins: 20, priceCents: 599 },
  { id: 'adventurer', name: 'Adventurer Chest', coins: 1600, bonusCoins: 120, priceCents: 999 },
  { id: 'legend', name: 'Legendary Hoard', coins: 3200, bonusCoins: 300, priceCents: 1999 },
];
