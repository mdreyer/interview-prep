// 7.1 Bug hunt: the slow Marketplace page. The spec is in README.md in this folder.
// This component WORKS (mostly). Your job is to find out why it's slow, and the one place it's actually wrong.
// Keep the perf.trackCardRender() and perf.trackSort() calls: the tests count them.
import { useState, type CSSProperties } from 'react';
import { perf } from './perfTracker';
import type { Skin } from './skins.fixture';

function sortByPopularity(skins: Skin[]): Skin[] {
  perf.trackSort();
  // Pretend this is expensive (in the real page it's a weighted ranking over thousands of items).
  return [...skins].sort((a, b) => b.popularity - a.popularity);
}

export function MarketplacePage({ skins }: { skins: Skin[] }) {
  const [search, setSearch] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const sorted = sortByPopularity(skins);
  const visible = sorted.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function toggleWishlist(id: string) {
    setWishlist(wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id]);
  }

  return (
    <div>
      <label>
        Search skins <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <label>
        Gift message <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
      </label>
      <p>{wishlist.length} on your wishlist</p>
      <ul aria-label="Skins">
        {visible.map((skin, index) => (
          <SkinCard
            key={index}
            skin={skin}
            wishlisted={wishlist.includes(skin.id)}
            onToggleWishlist={() => toggleWishlist(skin.id)}
            formatter={formatter}
            style={{ padding: 8, listStyle: 'none' }}
          />
        ))}
      </ul>
    </div>
  );
}

function SkinCard({
  skin,
  wishlisted,
  onToggleWishlist,
  formatter,
  style,
}: {
  skin: Skin;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  formatter: Intl.NumberFormat;
  style: CSSProperties;
}) {
  perf.trackCardRender(skin.id);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <li style={style}>
      <h3>{skin.name}</h3>
      <p>{formatter.format(skin.priceCents / 100)}</p>
      <button type="button" aria-pressed={wishlisted} onClick={onToggleWishlist}>
        Wishlist <span className="visually-hidden">{skin.name}</span>
      </button>
      <button type="button" aria-expanded={showDetails} onClick={() => setShowDetails((s) => !s)}>
        Details <span className="visually-hidden">{skin.name}</span>
      </button>
      {showDetails && <p>{skin.description}</p>}
    </li>
  );
}
