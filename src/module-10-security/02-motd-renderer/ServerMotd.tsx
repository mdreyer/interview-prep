// 10.2 ServerMotd. The spec is in README.md in this folder.
// The previous version (below) works, and it's an XSS hole: the MOTD comes from whoever runs the server.

export const COLORS = {
  '0': 'black',
  '1': 'dark-blue',
  '2': 'dark-green',
  '3': 'dark-aqua',
  '4': 'dark-red',
  '5': 'dark-purple',
  '6': 'gold',
  '7': 'gray',
  '8': 'dark-gray',
  '9': 'blue',
  a: 'green',
  b: 'aqua',
  c: 'red',
  d: 'light-purple',
  e: 'yellow',
  f: 'white',
} as const;

export type ColorName = (typeof COLORS)[keyof typeof COLORS];

export interface Style {
  color?: ColorName;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

export interface Segment extends Style {
  text: string;
}

export function parseMotd(input: string): Segment[] {
  // TODO: parse the § codes into segments of plain text plus a style.
  return [{ text: input }];
}

/** The old approach. Don't keep this. */
function toHtml(motd: string): string {
  return motd
    .replace(/§([0-9a-f])/gi, (_, code: string) => `</span><span class="mc-${COLORS[code.toLowerCase() as keyof typeof COLORS]}">`)
    .replace(/§l/gi, '<b>')
    .replace(/§r/gi, '</b></span><span>')
    .replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
}

export function ServerMotd({ motd }: { motd: string }) {
  return <p className="motd" dangerouslySetInnerHTML={{ __html: `<span>${toHtml(motd)}</span>` }} />;
}
