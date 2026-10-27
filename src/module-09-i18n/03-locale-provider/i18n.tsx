// 9.3 I18nProvider. The spec is in README.md in this folder.
import { createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react';

export const SUPPORTED_LOCALES = ['en', 'de', 'ja', 'pt-BR', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const STORAGE_KEY = 'mc-locale';

export function negotiateLocale(
  requested: readonly string[],
  supported: readonly string[] = SUPPORTED_LOCALES,
  fallback = 'en',
): string {
  // TODO
  return fallback;
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  // TODO
  return 'ltr';
}

interface I18nValue {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: SupportedLocale) => void;
  formatNumber: (value: number) => string;
}

export function I18nProvider({
  children,
  requestedLocales = typeof navigator === 'undefined' ? [] : navigator.languages,
}: {
  children: ReactNode;
  requestedLocales?: readonly string[];
}) {
  // TODO: Create, Provide, Hook (4.3)
  return <>{children}</>;
}

export function useI18n(): I18nValue {
  // TODO
  return { locale: 'en', dir: 'ltr', setLocale: () => {}, formatNumber: String };
}

export function LanguagePicker() {
  // TODO
  return null;
}
