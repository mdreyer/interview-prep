// Playground: run `npm run dev` to try your components by hand in the browser preview.
// You don't need to edit this file. The tests are the real feedback loop.
import { StrictMode, useState, type ReactNode } from 'react';
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
      <p>Tip: DevTools → Network → set throttling to "Offline" to test.</p>
      <PurchaseButton onPurchase={() => console.log('purchase!')} />
    </>
  ),
  '2.4 Bug hunt: balance': () => <BalanceDemo />,
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
      <div key={current}>{PROBLEMS[current]!()}</div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
