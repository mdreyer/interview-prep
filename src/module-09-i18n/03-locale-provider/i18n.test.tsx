import { Component, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDirection, I18nProvider, LanguagePicker, negotiateLocale, STORAGE_KEY, useI18n } from './i18n';

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
  window.localStorage.clear();
});

function Balance() {
  const { formatNumber, locale } = useI18n();
  return (
    <p>
      {locale}: {formatNumber(1234567.5)}
    </p>
  );
}

function setup(requestedLocales: string[] = ['en-US']) {
  const user = userEvent.setup();
  render(
    <I18nProvider requestedLocales={requestedLocales}>
      <LanguagePicker />
      <Balance />
    </I18nProvider>,
  );
  return { user, picker: () => screen.getByRole('combobox', { name: 'Language' }) };
}

describe('9.3 negotiateLocale and getDirection', () => {
  it("picks the best supported locale from the browser's list, in priority order", () => {
    expect(negotiateLocale(['de-AT', 'en'])).toBe('de');
    expect(negotiateLocale(['fr-CA', 'ja-JP'])).toBe('ja');
    expect(negotiateLocale(['pt-PT'])).toBe('pt-BR');
    expect(negotiateLocale(['PT-br'])).toBe('pt-BR');
    expect(negotiateLocale(['ar-EG'])).toBe('ar');
    expect(negotiateLocale(['ko-KR', 'fr'])).toBe('en');
    expect(negotiateLocale([])).toBe('en');
  });

  it('knows which languages are written right-to-left', () => {
    expect(getDirection('ar')).toBe('rtl');
    expect(getDirection('he-IL')).toBe('rtl');
    expect(getDirection('fa')).toBe('rtl');
    expect(getDirection('en')).toBe('ltr');
    expect(getDirection('ja')).toBe('ltr');
  });
});

describe('9.3 I18nProvider + LanguagePicker', () => {
  it("starts from the browser's languages, and sets <html lang> and <html dir>", () => {
    setup(['de-AT', 'en']);
    expect(document.documentElement).toHaveAttribute('lang', 'de');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('de: 1.234.567,5')).toBeInTheDocument();
  });

  it('names each language in its own language, marked with its own lang attribute', () => {
    const { picker } = setup();
    const options = Array.from((picker() as HTMLSelectElement).options);
    expect(options.map((o) => o.value)).toEqual(['en', 'de', 'ja', 'pt-BR', 'ar']);
    expect(options.map((o) => o.textContent)).toEqual(['English', 'Deutsch', '日本語', 'português (Brasil)', 'العربية']);
    expect(options.map((o) => o.getAttribute('lang'))).toEqual(['en', 'de', 'ja', 'pt-BR', 'ar']);
  });

  it('switching to Arabic flips the page to right-to-left, reformats numbers, and remembers the choice', async () => {
    const { user, picker } = setup(['en-US']);
    expect(screen.getByText('en: 1,234,567.5')).toBeInTheDocument();
    await user.selectOptions(picker(), 'ar');
    expect(picker()).toHaveValue('ar');
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ar');
    await user.selectOptions(picker(), 'ja');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  });

  it("a saved choice wins over the browser's languages", () => {
    window.localStorage.setItem(STORAGE_KEY, 'ja');
    const { picker } = setup(['de-DE']);
    expect(picker()).toHaveValue('ja');
    expect(document.documentElement).toHaveAttribute('lang', 'ja');
  });

  it('ignores a saved value that is not a supported locale (validate what you read from storage)', () => {
    window.localStorage.setItem(STORAGE_KEY, '"><img src=x onerror=alert(1)>');
    const { picker } = setup(['de-DE']);
    expect(picker()).toHaveValue('de');
  });

  it('still works when localStorage throws (privacy modes)', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    const { picker } = setup(['ja']);
    spy.mockRestore();
    expect(picker()).toHaveValue('ja');
  });

  it('useI18n outside the provider throws a helpful error', () => {
    class Catch extends Component<{ children: ReactNode }, { error: Error | null }> {
      state = { error: null as Error | null };
      static getDerivedStateFromError(error: Error) {
        return { error };
      }
      render() {
        return this.state.error ? <p>Caught: {this.state.error.message}</p> : this.props.children;
      }
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Catch>
        <Balance />
      </Catch>,
    );
    spy.mockRestore();
    expect(screen.getByText(/^Caught:/)).toHaveTextContent(/I18nProvider/);
  });
});
