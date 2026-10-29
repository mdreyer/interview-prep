import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileSettingsForm, type ProfileSettings } from './ProfileSettingsForm';

const INITIAL: ProfileSettings = {
  gamertag: 'Alex_Builds',
  language: 'en-US',
  marketingEmails: false,
};

function setup(initialValues: ProfileSettings = INITIAL) {
  const onSave = vi.fn();
  const user = userEvent.setup();
  render(<ProfileSettingsForm initialValues={initialValues} onSave={onSave} />);
  return {
    user,
    onSave,
    gamertag: screen.getByRole('textbox', { name: 'Gamertag' }),
    language: screen.getByRole('combobox', { name: 'Language' }),
    marketing: screen.getByRole('checkbox', { name: 'Send me news and offers' }),
    save: screen.getByRole('button', { name: 'Save changes' }),
    reset: screen.getByRole('button', { name: 'Reset' }),
  };
}

describe('1.2 ProfileSettingsForm', () => {
  it('renders labelled fields populated from initialValues', () => {
    const { gamertag, language, marketing } = setup();
    expect(gamertag).toHaveValue('Alex_Builds');
    expect(language).toHaveValue('en-US');
    expect(marketing).not.toBeChecked();
    expect(screen.getAllByRole('option')).toHaveLength(5);
    expect(screen.getByRole('option', { name: '日本語' })).toBeInTheDocument();
  });

  it('starts pristine: Save and Reset are disabled', () => {
    const { save, reset } = setup();
    expect(save).toBeDisabled();
    expect(reset).toBeDisabled();
  });

  it('enables Save and Reset once a field changes', async () => {
    const { user, marketing, save, reset } = setup();
    await user.click(marketing);
    expect(save).toBeEnabled();
    expect(reset).toBeEnabled();
  });

  it('is not dirty when a change is undone by hand (compares values, not "touched")', async () => {
    const { user, language, save } = setup();
    await user.selectOptions(language, 'de-DE');
    expect(save).toBeEnabled();
    await user.selectOptions(language, 'en-US');
    expect(save).toBeDisabled();
  });

  it('treats surrounding whitespace in the gamertag as no change', async () => {
    const { user, gamertag, save } = setup();
    await user.type(gamertag, '   ');
    expect(save).toBeDisabled();
  });

  it('shows the length error, wires it up accessibly, and blocks saving', async () => {
    const { user, gamertag, save } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'Al');
    expect(gamertag).toHaveAttribute('aria-invalid', 'true');
    expect(gamertag).toHaveAccessibleDescription('Gamertag must be between 3 and 16 characters.');
    expect(screen.getByText('Gamertag must be between 3 and 16 characters.')).toBeInTheDocument();
    expect(save).toBeDisabled();
  });

  it('rejects names longer than 16 characters', async () => {
    const { user, gamertag } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'ThisNameIsWayTooLong');
    expect(gamertag).toHaveAccessibleDescription('Gamertag must be between 3 and 16 characters.');
  });

  it('shows the character error for invalid characters', async () => {
    const { user, gamertag, save } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'Steve!!');
    expect(gamertag).toHaveAttribute('aria-invalid', 'true');
    expect(gamertag).toHaveAccessibleDescription(
      'Gamertag can only use letters, numbers, and underscores.',
    );
    expect(screen.queryByText('Gamertag must be between 3 and 16 characters.')).not.toBeInTheDocument();
    expect(save).toBeDisabled();
  });

  it('clears the error once the value is valid again', async () => {
    const { user, gamertag } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'Al');
    await user.type(gamertag, 'ex');
    expect(gamertag).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Gamertag must be between 3 and 16 characters.')).not.toBeInTheDocument();
  });

  it('saves trimmed values and makes them the new baseline', async () => {
    const { user, onSave, gamertag, language, marketing, save, reset } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, '  Steve_2026  ');
    await user.selectOptions(language, 'ja-JP');
    await user.click(marketing);
    await user.click(save);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      gamertag: 'Steve_2026',
      language: 'ja-JP',
      marketingEmails: true,
    });
    expect(gamertag).toHaveValue('Steve_2026');
    expect(save).toBeDisabled();
    expect(reset).toBeDisabled();
  });

  it('submits when Enter is pressed in the gamertag field', async () => {
    const { user, onSave, gamertag } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'Steve{Enter}');
    expect(onSave).toHaveBeenCalledWith({ ...INITIAL, gamertag: 'Steve' });
  });

  it('does not call onSave on Enter when the form is invalid', async () => {
    const { user, onSave, gamertag } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'x{Enter}');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('Reset restores the last saved values', async () => {
    const { user, gamertag, language, marketing, save, reset } = setup();
    await user.clear(gamertag);
    await user.type(gamertag, 'Steve');
    await user.click(save);

    await user.clear(gamertag);
    await user.type(gamertag, 'Herobrine');
    await user.selectOptions(language, 'pt-BR');
    await user.click(marketing);
    await user.click(reset);

    expect(gamertag).toHaveValue('Steve');
    expect(language).toHaveValue('en-US');
    expect(marketing).not.toBeChecked();
    expect(reset).toBeDisabled();
  });

  it('announces "Settings saved" in a persistent status region and clears it on edit', async () => {
    const { user, marketing, save } = setup();
    const status = screen.getByRole('status');
    expect(status).not.toHaveTextContent('Settings saved');

    await user.click(marketing);
    await user.click(save);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Settings saved');

    await user.click(marketing);
    expect(status).not.toHaveTextContent('Settings saved');
  });
});
