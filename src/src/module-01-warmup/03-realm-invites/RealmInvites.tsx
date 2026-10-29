// 1.3 Realm Invite Manager. The spec is in README.md in this folder.
import { useState } from 'react';

export type Friend = {
  id: string;
  gamertag: string;
  online: boolean;
};

export type RealmInvitesProps = {
  friends: readonly Friend[];
  maxInvites?: number;
  onSendInvites: (friendIds: string[]) => void;
};

export function RealmInvites({ friends, maxInvites = 10, onSendInvites }: RealmInvitesProps) {
  // TODO: build it (and its child components)!
  return <div>TODO: realm invites</div>;
}
