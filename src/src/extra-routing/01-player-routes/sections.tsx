// Given: the content of each profile section. You don't need to edit this file.
// Each section reads the username from the URL itself, with useParams.
import type { ComponentType } from 'react';
import { useParams } from 'react-router';

function Overview() {
  const { username } = useParams();
  return <p>{username}'s overview: joined in 2011, mostly plays Survival.</p>;
}

function Skins() {
  const { username } = useParams();
  return <p>{username}'s skins: Creeper Hoodie, Warden Costume, Allay Wings.</p>;
}

function Achievements() {
  const { username } = useParams();
  return <p>{username}'s achievements: 42 of 122 unlocked.</p>;
}

export const SECTIONS = [
  { id: 'overview', label: 'Overview', Component: Overview },
  { id: 'skins', label: 'Skins', Component: Skins },
  { id: 'achievements', label: 'Achievements', Component: Achievements },
] as const satisfies readonly { id: string; label: string; Component: ComponentType }[];

export type SectionId = (typeof SECTIONS)[number]['id'];
