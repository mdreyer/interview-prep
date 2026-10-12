// 5.3 ProfileForm. The spec is in README.md in this folder.
import { useId, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../ApiError';

export interface Profile {
  gamertag: string;
  bio: string;
}

export function ProfileForm({
  initialProfile,
  saveProfile,
}: {
  initialProfile: Profile;
  saveProfile: (profile: Profile) => Promise<Profile>;
}) {
  // TODO: build it!
  return <form>TODO: profile form</form>;
}
