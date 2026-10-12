export interface Skin {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  popularity: number;
}

const NAMES = [
  'Creeper Hoodie', 'Enderman Suit', 'Diamond Knight', 'Redstone Engineer', 'Nether Explorer', 'Axolotl Onesie',
  'Pillager Captain', 'Creeper Pajamas', 'Glow Squid Diver', 'Warden Costume', 'Bee Keeper', 'Ender Dragon Rider',
  'Piglin Brute', 'Snow Golem', 'Allay Wings', 'Sniffer Gardener', 'Iron Golem Armor', 'Wandering Trader',
  'Creeper Ninja', 'Blaze Runner', 'Panda Hoodie', 'Strider Saddle', 'Frog Prince', 'Villager Librarian',
];

export const SKINS: Skin[] = NAMES.map((name, i) => ({
  id: `skin-${i + 1}`,
  name,
  description: `${name}: a fan favorite from the Marketplace.`,
  priceCents: 99 + ((i * 37) % 5) * 100,
  popularity: (i * 7919) % 1000,
}));
