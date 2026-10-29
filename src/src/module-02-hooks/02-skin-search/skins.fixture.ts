import type { Skin } from './SkinSearch';

export const SKINS: Skin[] = [
  { id: 's1', name: 'Creeper Hoodie', creator: 'BlockWear' },
  { id: 's2', name: 'Creeper Knight', creator: 'PixelForge' },
  { id: 's3', name: 'Enderman Suit', creator: 'BlockWear' },
  { id: 's4', name: 'Axolotl Onesie', creator: 'CuteCraft' },
];

export function filterSkins(query: string) {
  const q = query.toLowerCase();
  return SKINS.filter((s) => s.name.toLowerCase().includes(q));
}
