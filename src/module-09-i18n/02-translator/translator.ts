// 9.2 createTranslator. The spec is in README.md in this folder.

/** A plain string, or one string per plural category ("one", "few", "other"…), plus an optional exact "=0". */
export type PluralMessage = Partial<Record<Intl.LDMLPluralRule | '=0', string>>;
export type Message = string | PluralMessage;
export type Catalog = Record<string, Message>;
export type Params = Record<string, string | number>;

export interface TranslatorOptions {
  locale: string;
  catalogs: Record<string, Catalog>;
  /** Default 'en'. */
  fallbackLocale?: string;
  onMissing?: (key: string, locale: string) => void;
}

/** "de-AT" -> ["de-AT", "de", "en"] (without duplicates). */
export function localeChain(locale: string, fallbackLocale = 'en'): string[] {
  // TODO
  return [locale];
}

export function createTranslator({ locale, catalogs, fallbackLocale = 'en', onMissing }: TranslatorOptions) {
  return function t(key: string, params: Params = {}): string {
    // TODO: build it!
    return key;
  };
}
