// 10.1 Safe redirects and links. The spec is in README.md in this folder.
import type { ReactNode } from 'react';

/** For `?returnUrl=` after sign-in. Only same-site paths are allowed; anything else becomes `fallback`. */
export function safeRedirectPath(returnUrl: string | null | undefined, fallback = '/'): string {
  // TODO
  return returnUrl || fallback;
}

/** For links players type into their profile. Only http(s), returned normalized; anything else -> undefined. */
export function safeExternalHref(input: string | null | undefined): string | undefined {
  // TODO
  return input ?? undefined;
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  // TODO
  return <a href={href}>{children}</a>;
}
