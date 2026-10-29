// 1.2 Profile Settings Form. The spec is in README.md in this folder.
import { useState } from 'react';

export const LANGUAGES = [
  { code: 'en-US', label: 'English (United States)' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'ar-SA', label: 'العربية' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export type ProfileSettings = {
  gamertag: string;
  language: LanguageCode;
  marketingEmails: boolean;
};

export type ProfileSettingsFormProps = {
  initialValues: ProfileSettings;
  onSave: (values: ProfileSettings) => void;
};

export function ProfileSettingsForm({ initialValues, onSave }: ProfileSettingsFormProps) {
  // TODO: build it!
  return <div>TODO: profile settings form</div>;
}
