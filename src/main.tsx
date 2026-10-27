// Playground: run `npm run dev` to try your components by hand in the browser preview.
// You don't need to edit this file. The tests are the real feedback loop.
import { Component, StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BundlePicker } from './module-01-warmup/01-bundle-picker/BundlePicker';
import { BUNDLES } from './module-01-warmup/01-bundle-picker/bundles.fixture';
import { ProfileSettingsForm } from './module-01-warmup/02-profile-settings/ProfileSettingsForm';
import { RealmInvites } from './module-01-warmup/03-realm-invites/RealmInvites';
import { FRIENDS } from './module-01-warmup/03-realm-invites/friends.fixture';
import { ServerList } from './module-01-warmup/04-bug-hunt-server-list/ServerList';
import { RealmStatus } from './module-02-hooks/01-realm-status/RealmStatus';
import { SkinSearch } from './module-02-hooks/02-skin-search/SkinSearch';
import { filterSkins } from './module-02-hooks/02-skin-search/skins.fixture';
import { PurchaseButton } from './module-02-hooks/03-online-status/OnlineStatus';
import { MinecoinBalance } from './module-02-hooks/04-bug-hunt-balance/MinecoinBalance';
import { SelectableList } from './module-03-typescript/04-generic-list/SelectableList';
import { CheckoutWizard } from './module-04-state/02-checkout-wizard/CheckoutWizard';
import { CartProvider, useCart, useCartActions } from './module-04-state/03-cart-context/CartContext';
import { MarketplaceFilters } from './module-04-state/04-url-state/MarketplaceFilters';
import { ApiError } from './module-05-api/ApiError';
import { ProfileForm, type Profile } from './module-05-api/03-server-validation/ProfileForm';
import { WishlistButton } from './module-05-api/04-optimistic-wishlist/WishlistButton';
import { RedeemCodeForm, type RedeemResult } from './module-06-react19/01-redeem-code/RedeemCodeForm';
import { RealmChat, type ChatMessage } from './module-06-react19/02-realm-chat/RealmChat';
import { ProfilePage } from './module-06-react19/03-use-suspense/ProfilePage';
import { ProfileTabs, type TabId } from './module-06-react19/04-transitions/ProfileTabs';
import { MarketplacePage } from './module-07-performance/01-rerender-bug-hunt/MarketplacePage';
import { SKINS } from './module-07-performance/01-rerender-bug-hunt/skins.fixture';
import { VirtualList } from './module-07-performance/02-virtual-list/VirtualList';
import { CheckoutLauncher } from './module-07-performance/03-lazy-preload/CheckoutLauncher';
import { ConfirmPurchase } from './module-08-accessibility/01-modal-dialog/ConfirmPurchase';
import { ServerSearch } from './module-08-accessibility/02-combobox/ServerSearch';
import { InventoryGrid } from './module-08-accessibility/03-inventory-grid/InventoryGrid';
import { RealmSettings } from './module-08-accessibility/04-a11y-bug-hunt/RealmSettings';
import { I18nProvider, LanguagePicker, useI18n } from './module-09-i18n/03-locale-provider/i18n';
import { Leaderboard } from './module-09-i18n/04-i18n-bug-hunt/Leaderboard';
import { ServerMotd } from './module-10-security/02-motd-renderer/ServerMotd';

const log = (label: string) => (value: unknown) => console.log(label, value);

// Fake APIs for the playground: random latency, so you can watch loading states and races.
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
const fakeFetchStatus = async (realmId: string) => {
  await delay(300 + Math.random() * 700);
  console.log('fetchStatus', realmId);
  return { online: Math.random() > 0.2, playerCount: Math.floor(Math.random() * 10) };
};
const fakeSearchSkins = async (query: string, signal: AbortSignal) => {
  console.log('searchSkins', query);
  await delay(200 + Math.random() * 1200, signal);
  return filterSkins(query);
};
const fakeFetchBalance = async (userId: string) => {
  await delay(300 + Math.random() * 700);
  return userId === 'alex' ? 1234 : 56789;
};

function RealmStatusDemo() {
  const [realmId, setRealmId] = useState('realm-1');
  return (
    <>
      <button type="button" onClick={() => setRealmId((r) => (r === 'realm-1' ? 'realm-2' : 'realm-1'))}>
        Switch realm (current: {realmId})
      </button>
      <RealmStatus realmId={realmId} fetchStatus={fakeFetchStatus} intervalMs={3000} />
    </>
  );
}

function BalanceDemo() {
  const [userId, setUserId] = useState('alex');
  const [locale, setLocale] = useState('en-US');
  return (
    <>
      <button type="button" onClick={() => setUserId((u) => (u === 'alex' ? 'steve' : 'alex'))}>
        Switch user (current: {userId})
      </button>{' '}
      <button type="button" onClick={() => setLocale((l) => (l === 'en-US' ? 'de-DE' : 'en-US'))}>
        Switch locale (current: {locale})
      </button>
      <MinecoinBalance userId={userId} fetchBalance={fakeFetchBalance} locale={locale} />
    </>
  );
}

function SelectableListDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <SelectableList
      label="Bundles"
      items={BUNDLES}
      getKey={(b) => b.id}
      getLabel={(b) => b.name}
      selectedKey={selected}
      onSelect={(b) => setSelected(b.id)}
    />
  );
}

const fakeSubmitOrder = async () => {
  await delay(1000);
  if (Math.random() < 0.4) throw new Error('Card declined');
  return { orderId: `o-${Math.floor(Math.random() * 10000)}` };
};

function CartDemo() {
  function Controls() {
    const { addItem, clear } = useCartActions();
    return (
      <p>
        <button type="button" onClick={() => addItem({ sku: 'MC-1720', name: '1,720 Minecoins', priceCents: 999 })}>
          Add coins
        </button>{' '}
        <button type="button" onClick={clear}>Clear</button>
      </p>
    );
  }
  function Summary() {
    const { lines, itemCount, totalCents } = useCart();
    return (
      <p>
        {itemCount} items, ${(totalCents / 100).toFixed(2)}: {lines.map((l) => `${l.name} × ${l.quantity}`).join(', ')}
      </p>
    );
  }
  return (
    <CartProvider>
      <Controls />
      <Summary />
    </CartProvider>
  );
}

// Module 5-7 fakes: random latency and random failures, so you can see every state.
const fakeSaveProfile = async (p: Profile): Promise<Profile> => {
  await delay(800);
  if (p.gamertag.trim().toLowerCase() === 'notch') {
    throw new ApiError({ kind: 'http', status: 400, title: 'One or more validation errors occurred.', fieldErrors: { gamertag: ['Gamertag is already taken.'] } });
  }
  if (p.bio.includes('creeper')) {
    throw new ApiError({ kind: 'http', status: 400, title: 'Validation failed', fieldErrors: { bio: ['Bio contains a blocked word.'] } });
  }
  if (Math.random() < 0.2) throw new ApiError({ kind: 'http', status: 500, title: 'Internal Server Error', traceId: '00-demo-01' });
  return { gamertag: p.gamertag.trim(), bio: p.bio.trim() };
};
const fakeSetWishlisted = async (id: string, value: boolean) => {
  await delay(500 + Math.random() * 1500);
  if (Math.random() < 0.3) throw new Error('503');
  console.log('wishlist saved', id, value);
};
const fakeRedeem = async (code: string): Promise<RedeemResult> => {
  await delay(1000);
  if (code.startsWith('AAAAA')) return { ok: false, reason: 'already-redeemed' };
  if (code.startsWith('EEEEE')) return { ok: false, reason: 'expired' };
  if (Math.random() < 0.2) throw new Error('boom');
  return Math.random() < 0.5 ? { ok: true, itemName: 'Creeper Hoodie' } : { ok: false, reason: 'not-found' };
};
let chatIds = 100;
const fakeSendMessage = async (text: string): Promise<ChatMessage> => {
  await delay(700 + Math.random() * 1500);
  if (Math.random() < 0.3) throw new Error('503');
  return { id: `m${++chatIds}`, author: 'Alex_Builds', text };
};
const fakeFetchProfile = async (username: string) => {
  await delay(800);
  if (Math.random() < 0.3) throw new Error('503');
  return { username, achievements: username.length * 7 };
};

function ProfilePageDemo() {
  const [username, setUsername] = useState('Steve');
  return (
    <>
      {['Steve', 'Alex', 'Notch_Fan'].map((u) => (
        <button key={u} type="button" aria-pressed={u === username} onClick={() => setUsername(u)}>
          {u}
        </button>
      ))}
      <ProfilePage username={username} fetchProfile={fakeFetchProfile} />
    </>
  );
}

function ProfileTabsDemo() {
  const [resources] = useState<Record<TabId, Promise<string>>>(() => ({
    overview: delay(600).then(() => 'Alex_Builds has played 412 hours.'),
    skins: delay(1500).then(() => '23 skins, 4 capes.'),
    achievements: delay(2500).then(() => '87 of 122 advancements.'),
  }));
  return <ProfileTabs resources={resources} />;
}

const BLOCKS = Array.from({ length: 10_000 }, (_, i) => ({ id: i + 1, name: `Block #${i + 1}` }));

const fakeLoadCheckout = async () => {
  await delay(1200);
  if (Math.random() < 0.3) throw new TypeError('Failed to fetch dynamically imported module');
  return {
    default: ({ onClose }: { onClose: () => void }) => (
      <div role="dialog" aria-label="Checkout" style={{ border: '1px solid', padding: 16 }}>
        <h2>Checkout</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ),
  };
};

const SLOTS = Array.from({ length: 27 }, (_, i) =>
  i % 4 === 0 ? { id: `item-${i}`, name: ['Oak Planks', 'Torch', 'Diamond', 'Bread', 'Cobblestone', 'Ender Pearl', 'Iron Pickaxe'][i % 7]!, count: (i % 64) + 1 } : null,
);
const SERVER_NAMES = ['Skyblock Isles', 'Creative Plots', 'Parkour Peak', 'Hypixel-ish Minigames', 'Survival Island', 'Bedwars Arena'];

function LocaleDemo() {
  function Readout() {
    const { locale, dir, formatNumber } = useI18n();
    return (
      <p>
        locale: {locale}, dir: {dir}, 1234567.5 is shown as {formatNumber(1234567.5)}
      </p>
    );
  }
  return (
    <I18nProvider>
      <LanguagePicker />
      <Readout />
    </I18nProvider>
  );
}

function LeaderboardDemo() {
  const [locale, setLocale] = useState('en-US');
  const now = new Date();
  const day = 86_400_000;
  return (
    <>
      <select aria-label="Locale" value={locale} onChange={(e) => setLocale(e.target.value)}>
        {['en-US', 'de-DE', 'ja-JP', 'pt-BR', 'ar'].map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <Leaderboard
        locale={locale}
        timeZone="Asia/Tokyo"
        now={now}
        seasonEnd={new Date('2026-10-30T15:00:00Z')}
        players={[
          { name: 'Zoe', score: 1234567, winRate: 0.853, country: 'DE', lastPlayed: new Date(now.getTime() - day) },
          { name: 'émile', score: 1234567, winRate: 0.5, country: 'BR', lastPlayed: new Date(now.getTime() - 3 * day) },
          { name: 'Ana', score: 1234567, winRate: 0.25, country: 'JP', lastPlayed: now },
        ]}
      />
    </>
  );
}

/** Keeps one unfinished problem (e.g. a starter that throws) from crashing the whole playground. */
class ProblemBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? <p role="alert">This problem threw an error: {this.state.error}</p> : this.props.children;
  }
}

const PROBLEMS: Record<string, () => ReactNode> = {
  '1.1 Bundle picker': () => <BundlePicker bundles={BUNDLES} onPurchase={log('purchase')} />,
  '1.2 Profile settings': () => (
    <ProfileSettingsForm
      initialValues={{ gamertag: 'Alex_Builds', language: 'en-US', marketingEmails: false }}
      onSave={log('save')}
    />
  ),
  '1.3 Realm invites': () => <RealmInvites friends={FRIENDS} onSendInvites={log('send invites')} />,
  '1.4 Bug hunt': () => (
    <ServerList
      initialServers={[
        { id: 1, name: 'Skyblock Isles', address: 'sky.example.net' },
        { id: 2, name: 'Creative Plots', address: 'build.example.org' },
        { id: 3, name: 'Parkour Peak', address: 'parkour.example.com' },
      ]}
    />
  ),
  '2.1 Realm status': () => <RealmStatusDemo />,
  '2.2 Skin search': () => <SkinSearch searchSkins={fakeSearchSkins} />,
  '2.3 Purchase button': () => (
    <>
      <p>Tip: in DevTools, open the Network tab and set throttling to "Offline" to test.</p>
      <PurchaseButton onPurchase={() => console.log('purchase!')} />
    </>
  ),
  '2.4 Bug hunt: balance': () => <BalanceDemo />,
  '3.4 Generic list': () => <SelectableListDemo />,
  '4.2 Checkout wizard': () => <CheckoutWizard submitOrder={fakeSubmitOrder} />,
  '4.3 Cart context': () => <CartDemo />,
  '4.4 URL filters': () => <MarketplaceFilters />,
  '5.3 Profile form': () => (
    <>
      <p>Tip: gamertag "Notch" or a bio containing "creeper" fails validation.</p>
      <ProfileForm initialProfile={{ gamertag: 'Alex_Builds', bio: 'I build castles.' }} saveProfile={fakeSaveProfile} />
    </>
  ),
  '5.4 Wishlist': () => (
    <WishlistButton itemId="skin-1" itemName="Creeper Hoodie" initialWishlisted={false} setWishlisted={fakeSetWishlisted} />
  ),
  '6.1 Redeem code': () => <RedeemCodeForm redeemCode={fakeRedeem} />,
  '6.2 Realm chat': () => (
    <RealmChat
      currentUser="Alex_Builds"
      initialMessages={[{ id: 'm1', author: 'Steve', text: 'Anyone up for the Nether?' }]}
      sendMessage={fakeSendMessage}
    />
  ),
  '6.3 Profile (use)': () => <ProfilePageDemo />,
  '6.4 Profile tabs': () => <ProfileTabsDemo />,
  '7.1 Marketplace': () => <MarketplacePage skins={SKINS} />,
  '7.2 Virtual list': () => (
    <VirtualList label="Blocks" items={BLOCKS} itemHeight={32} height={320} getKey={(b) => b.id} renderItem={(b) => b.name} />
  ),
  '7.3 Lazy checkout': () => <CheckoutLauncher loadCheckoutDialog={fakeLoadCheckout} />,
  '8.1 Dialog': () => <ConfirmPurchase bundleName="Explorer Bundle" price="990 Minecoins" onConfirm={() => console.log('bought!')} />,
  '8.2 Combobox': () => <ServerSearch servers={SERVER_NAMES} onSelect={log('selected')} />,
  '8.3 Inventory grid': () => <InventoryGrid slots={SLOTS} onSelect={log('slot')} />,
  '8.4 A11y bug hunt': () => (
    <RealmSettings
      initial={{ name: 'Skyblock Isles', allowCheats: false }}
      thumbnailUrl="https://placehold.co/160x90"
      onSave={log('save')}
      onClose={() => console.log('close')}
    />
  ),
  '9.3 Locale provider': () => <LocaleDemo />,
  '9.4 i18n bug hunt': () => <LeaderboardDemo />,
  '10.2 MOTD': () => <ServerMotd motd="§6§lSkyblock Isles §r§7| §aNew islands! §ehttps://discord.example/skyblock §c<b>not bold</b>" />,
};

function Playground() {
  const names = Object.keys(PROBLEMS);
  const [current, setCurrent] = useState(names[0]!);
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Mojang prep playground</h1>
      <nav aria-label="Problems" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {names.map((name) => (
          <button key={name} type="button" aria-pressed={name === current} onClick={() => setCurrent(name)}>
            {name}
          </button>
        ))}
      </nav>
      {/* key forces a fresh mount when switching problems */}
      <ProblemBoundary key={current}>{PROBLEMS[current]!()}</ProblemBoundary>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
