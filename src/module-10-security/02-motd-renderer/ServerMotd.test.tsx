import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { parseMotd, ServerMotd } from './ServerMotd';

describe('10.2 parseMotd', () => {
  it('plain text is one unstyled segment', () => {
    expect(parseMotd('Welcome to Skyblock Isles')).toEqual([{ text: 'Welcome to Skyblock Isles' }]);
  });

  it('color codes (§0-§9, §a-§f, either case) set the color', () => {
    expect(parseMotd('§6Gold §bAqua §CRed')).toEqual([
      { color: 'gold', text: 'Gold ' },
      { color: 'aqua', text: 'Aqua ' },
      { color: 'red', text: 'Red' },
    ]);
  });

  it('format codes stack: §l bold, §o italic, §n underline, §m strikethrough, §k obfuscated', () => {
    expect(parseMotd('§a§l§nNEW§r update')).toEqual([
      { color: 'green', bold: true, underline: true, text: 'NEW' },
      { text: ' update' },
    ]);
    expect(parseMotd('§o§m§kx')).toEqual([{ italic: true, strikethrough: true, obfuscated: true, text: 'x' }]);
  });

  it('a color code resets formatting (like Java Edition); §r resets everything', () => {
    expect(parseMotd('§lBold §cred-not-bold §r plain')).toEqual([
      { bold: true, text: 'Bold ' },
      { color: 'red', text: 'red-not-bold ' },
      { text: ' plain' },
    ]);
  });

  it('drops unknown codes and a trailing §, and merges neighbors with the same style', () => {
    expect(parseMotd('§aHello §z§aWorld§')).toEqual([{ color: 'green', text: 'Hello World' }]);
  });
});

describe('10.2 ServerMotd', () => {
  it('renders segments as spans with mc-* classes', () => {
    const { container } = render(<ServerMotd motd="§6§lHypixel-ish §r§7| §aNow with Bedwars" />);
    const spans = Array.from(container.querySelectorAll('span'));
    expect(spans.map((s) => [s.className, s.textContent])).toEqual([
      ['mc-gold mc-bold', 'Hypixel-ish '],
      ['mc-gray', '| '],
      ['mc-green', 'Now with Bedwars'],
    ]);
  });

  it('never turns server-controlled text into HTML', () => {
    const { container } = render(
      <ServerMotd motd={'§c<img src=x onerror="window.__pwned=true"><script>window.__pwned=true</script>§r<b>bold?</b>'} />,
    );
    expect(container.querySelector('img, script, b')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror="window.__pwned=true">');
    expect(container.textContent).toContain('<b>bold?</b>');
    expect((window as { __pwned?: boolean }).__pwned).toBeUndefined();
  });

  it('turns http(s) URLs into safe links, keeping their style', () => {
    const { container } = render(<ServerMotd motd="§eJoin our Discord: https://discord.example/skyblock now!" />);
    const link = screen.getByRole('link', { name: 'https://discord.example/skyblock' });
    expect(link).toHaveAttribute('href', 'https://discord.example/skyblock');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('ugc');
    expect(link.closest('span')).toHaveClass('mc-yellow');
    expect(container.textContent).toBe('Join our Discord: https://discord.example/skyblock now!');
  });

  it("doesn't link javascript: or other schemes", () => {
    render(<ServerMotd motd="Click javascript:alert(1) or data:text/html,hi" />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
