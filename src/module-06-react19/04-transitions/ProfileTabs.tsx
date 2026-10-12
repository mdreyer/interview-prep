// 6.4 ProfileTabs. The spec is in README.md in this folder.
import { Suspense, use, useId, useState, useTransition } from 'react';

export const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'skins', label: 'Skins' },
  { id: 'achievements', label: 'Achievements' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export function ProfileTabs({ resources }: { resources: Record<TabId, Promise<string>> }) {
  // TODO: build it!
  return <div>TODO: profile tabs</div>;
}
