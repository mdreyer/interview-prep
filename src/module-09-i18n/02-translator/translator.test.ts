import { describe, expect, it, vi } from 'vitest';
import { createTranslator, localeChain, type Catalog } from './translator';

const en: Catalog = {
  'inventory.items': { '=0': 'Your inventory is empty', one: '{count} item', other: '{count} items' },
  'friends.online': { one: '{count} friend online', other: '{count} friends online' },
  'greeting': 'Welcome back, {name}!',
  'realm.slots': 'Players: {used} / {max}',
  'only.in.english': { one: '{count} block', other: '{count} blocks' },
};
const de: Catalog = {
  'inventory.items': { '=0': 'Dein Inventar ist leer', one: '{count} Gegenstand', other: '{count} Gegenstände' },
  'greeting': 'Willkommen zurück, {name}!',
};
const deAT: Catalog = {
  'greeting': 'Servus, {name}!',
};
const pl: Catalog = {
  'inventory.items': { one: '{count} przedmiot', few: '{count} przedmioty', many: '{count} przedmiotów', other: '{count} przedmiotu' },
};
const ar: Catalog = {
  'friends.online': {
    zero: 'لا أصدقاء متصلون',
    one: 'صديق واحد متصل',
    two: 'صديقان متصلان',
    few: '{count} أصدقاء متصلون',
    many: '{count} صديقًا متصلًا',
    other: '{count} صديق متصل',
  },
};
const catalogs = { en, de, 'de-AT': deAT, pl, ar };

describe('9.2 createTranslator', () => {
  it('looks up plain strings and fills in {placeholders}', () => {
    const t = createTranslator({ locale: 'en', catalogs });
    expect(t('greeting', { name: 'Alex_Builds' })).toBe('Welcome back, Alex_Builds!');
  });

  it('picks the English plural form with Intl.PluralRules, and supports an exact "=0" message', () => {
    const t = createTranslator({ locale: 'en', catalogs });
    expect(t('inventory.items', { count: 0 })).toBe('Your inventory is empty');
    expect(t('inventory.items', { count: 1 })).toBe('1 item');
    expect(t('inventory.items', { count: 2 })).toBe('2 items');
  });

  it("handles languages with more plural forms than English: Polish (one/few/many)", () => {
    const t = createTranslator({ locale: 'pl', catalogs });
    expect(t('inventory.items', { count: 1 })).toBe('1 przedmiot');
    expect(t('inventory.items', { count: 3 })).toBe('3 przedmioty');
    expect(t('inventory.items', { count: 5 })).toBe('5 przedmiotów');
    expect(t('inventory.items', { count: 22 })).toBe('22 przedmioty');
    expect(t('inventory.items', { count: 12 })).toBe('12 przedmiotów');
  });

  it('…and Arabic (zero/one/two/few/many/other)', () => {
    const t = createTranslator({ locale: 'ar', catalogs });
    expect(t('friends.online', { count: 0 })).toBe('لا أصدقاء متصلون');
    expect(t('friends.online', { count: 2 })).toBe('صديقان متصلان');
    expect(t('friends.online', { count: 3 })).toBe('3 أصدقاء متصلون');
    expect(t('friends.online', { count: 11 })).toBe('11 صديقًا متصلًا');
  });

  it('formats numbers in placeholders for the locale', () => {
    expect(createTranslator({ locale: 'en', catalogs })('inventory.items', { count: 1234 })).toBe('1,234 items');
    expect(createTranslator({ locale: 'de', catalogs })('inventory.items', { count: 1234 })).toBe('1.234 Gegenstände');
    expect(createTranslator({ locale: 'en', catalogs })('realm.slots', { used: 7, max: 10 })).toBe('Players: 7 / 10');
  });

  it('falls back from a regional locale to its base language, then to English', () => {
    const t = createTranslator({ locale: 'de-AT', catalogs });
    expect(t('greeting', { name: 'Steve' })).toBe('Servus, Steve!');
    expect(t('inventory.items', { count: 2 })).toBe('2 Gegenstände');
    expect(t('friends.online', { count: 3 })).toBe('3 friends online');
  });

  it('uses the plural rules of the language the message is written in, after falling back', () => {
    // Polish says "few" for 2, but the fallback message is English, which only has one/other.
    const t = createTranslator({ locale: 'pl', catalogs });
    expect(t('only.in.english', { count: 2 })).toBe('2 blocks');
  });

  it('returns the key itself and reports it when a message is missing everywhere', () => {
    const onMissing = vi.fn();
    const t = createTranslator({ locale: 'de', catalogs, onMissing });
    expect(t('does.not.exist')).toBe('does.not.exist');
    expect(onMissing).toHaveBeenCalledWith('does.not.exist', 'de');
  });

  it('leaves unknown placeholders alone, and inserts values as plain text', () => {
    const t = createTranslator({ locale: 'en', catalogs });
    expect(t('greeting', {})).toBe('Welcome back, {name}!');
    expect(t('greeting', { name: '<b>Steve</b>' })).toBe('Welcome back, <b>Steve</b>!');
  });

  it('localeChain lists the lookup order without duplicates', () => {
    expect(localeChain('de-AT')).toEqual(['de-AT', 'de', 'en']);
    expect(localeChain('en-GB')).toEqual(['en-GB', 'en']);
    expect(localeChain('en')).toEqual(['en']);
    expect(localeChain('pt-BR', 'pt')).toEqual(['pt-BR', 'pt']);
  });
});
