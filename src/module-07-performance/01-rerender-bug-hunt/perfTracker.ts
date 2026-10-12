// Counters the 7.1 tests read. You don't need to edit this file, but keep the calls to it in place.

const cardRenders = new Map<string, number>();
let sorts = 0;

export const perf = {
  trackCardRender(id: string) {
    cardRenders.set(id, (cardRenders.get(id) ?? 0) + 1);
  },
  trackSort() {
    sorts++;
  },
  /** Total SkinCard renders since the last reset, or for one skin. */
  cardRenders(id?: string) {
    if (id) return cardRenders.get(id) ?? 0;
    let total = 0;
    for (const n of cardRenders.values()) total += n;
    return total;
  },
  sorts() {
    return sorts;
  },
  reset() {
    cardRenders.clear();
    sorts = 0;
  },
};
