import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink, safeExternalHref, safeRedirectPath } from './safeUrls';

describe('10.1 safeRedirectPath (open-redirect protection)', () => {
  it('allows same-site paths, keeping the query string and hash', () => {
    expect(safeRedirectPath('/profile')).toBe('/profile');
    expect(safeRedirectPath('/realms?tab=invites#top')).toBe('/realms?tab=invites#top');
    expect(safeRedirectPath('/store/minecoins')).toBe('/store/minecoins');
  });

  it('falls back when there is nothing to redirect to', () => {
    expect(safeRedirectPath(null)).toBe('/');
    expect(safeRedirectPath(undefined)).toBe('/');
    expect(safeRedirectPath('')).toBe('/');
    expect(safeRedirectPath('', '/home')).toBe('/home');
  });

  it('rejects absolute URLs to other sites', () => {
    expect(safeRedirectPath('https://evil.example/login')).toBe('/');
    expect(safeRedirectPath('http://evil.example')).toBe('/');
  });

  it('rejects protocol-relative and backslash tricks', () => {
    expect(safeRedirectPath('//evil.example')).toBe('/');
    expect(safeRedirectPath('/\\evil.example')).toBe('/');
    expect(safeRedirectPath('\\\\evil.example')).toBe('/');
  });

  it('rejects tricks that rely on the URL parser stripping tabs and newlines', () => {
    expect(safeRedirectPath('/\t/evil.example')).toBe('/');
    expect(safeRedirectPath('/\n/evil.example')).toBe('/');
  });

  it('rejects script URLs and anything that is not a path', () => {
    expect(safeRedirectPath('javascript:alert(document.cookie)')).toBe('/');
    expect(safeRedirectPath('data:text/html,<script>alert(1)</script>')).toBe('/');
    expect(safeRedirectPath('profile')).toBe('/');
    expect(safeRedirectPath(' /profile')).toBe('/');
  });
});

describe('10.1 safeExternalHref', () => {
  it('allows http and https links, normalized', () => {
    expect(safeExternalHref('https://www.youtube.com/@AlexBuilds')).toBe('https://www.youtube.com/@AlexBuilds');
    expect(safeExternalHref('http://example.com')).toBe('http://example.com/');
    expect(safeExternalHref('https://example.com/my builds')).toBe('https://example.com/my%20builds');
  });

  it('rejects javascript:, data:, vbscript:, in any case and with leading spaces', () => {
    expect(safeExternalHref('javascript:alert(1)')).toBeUndefined();
    expect(safeExternalHref('JaVaScRiPt:alert(1)')).toBeUndefined();
    expect(safeExternalHref('  javascript:alert(1)')).toBeUndefined();
    expect(safeExternalHref('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeUndefined();
    expect(safeExternalHref('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('rejects things that are not absolute URLs', () => {
    expect(safeExternalHref('www.example.com')).toBeUndefined();
    expect(safeExternalHref('/relative')).toBeUndefined();
    expect(safeExternalHref('')).toBeUndefined();
    expect(safeExternalHref(null)).toBeUndefined();
  });
});

describe('10.1 ExternalLink', () => {
  it('renders a safe link that opens in a new tab without giving the new page access to this one', () => {
    render(<ExternalLink href="https://www.youtube.com/@AlexBuilds">My channel</ExternalLink>);
    const link = screen.getByRole('link', { name: /My channel/ });
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/@AlexBuilds');
    expect(link).toHaveAttribute('target', '_blank');
    const rel = link.getAttribute('rel')?.split(' ') ?? [];
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    expect(link).toHaveTextContent('My channel (opens in a new tab)');
  });

  it('renders an unsafe URL as plain text, not a link', () => {
    render(<ExternalLink href="javascript:alert(1)">My channel</ExternalLink>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('My channel')).toBeInTheDocument();
  });
});
