import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { ApiError } from '../ApiError';
import { ProfileForm, type Profile } from './ProfileForm';

const INITIAL: Profile = { gamertag: 'Alex_Builds', bio: 'I build castles.' };

const validation = (fieldErrors: Record<string, string[]>, extra: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
  new ApiError({ kind: 'http', status: 400, title: 'One or more validation errors occurred.', fieldErrors, ...extra });

function setup(saveProfile: (profile: Profile) => Promise<Profile> = vi.fn(async (p: Profile) => p)) {
  const user = userEvent.setup();
  render(<ProfileForm initialProfile={INITIAL} saveProfile={saveProfile} />);
  return {
    user,
    saveProfile,
    gamertag: () => screen.getByRole('textbox', { name: 'Gamertag' }),
    bio: () => screen.getByRole('textbox', { name: 'Bio' }),
    save: () => screen.getByRole('button', { name: /save changes|saving/i }),
  };
}

describe('5.3 ProfileForm (server-side validation)', () => {
  it('submits the edited values, shows "Saving…" while pending, then "Profile saved."', async () => {
    const pending = deferred<Profile>();
    const { user, saveProfile, gamertag, save } = setup(vi.fn(() => pending.promise));
    await user.clear(gamertag());
    await user.type(gamertag(), 'Alex_Builds_2');
    await user.click(save());

    expect(saveProfile).toHaveBeenCalledWith({ gamertag: 'Alex_Builds_2', bio: 'I build castles.' });
    expect(save()).toHaveTextContent('Saving…');
    expect(save()).toBeDisabled();

    pending.resolve({ gamertag: 'Alex_Builds_2', bio: 'I build castles.' });
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Profile saved.');
    expect(save()).toHaveTextContent('Save changes');
    expect(save()).toBeEnabled();
  });

  it('shows what the server saved (the C# API may normalize values)', async () => {
    const { user, bio, save } = setup(vi.fn(async (p: Profile) => ({ ...p, bio: p.bio.trim() })));
    await user.type(bio(), '   ');
    await user.click(save());
    await screen.findByText('Profile saved.');
    expect(bio()).toHaveValue('I build castles.');
  });

  it('maps a 400 ValidationProblemDetails onto the fields: message, aria-invalid, aria-describedby', async () => {
    const { user, gamertag, bio, save } = setup(
      vi.fn(async () => {
        throw validation({ gamertag: ['Gamertag is already taken.', 'Second message is not shown.'], bio: ['Bio is too long.'] });
      }),
    );
    await user.click(save());

    await waitFor(() => expect(gamertag()).toHaveAttribute('aria-invalid', 'true'));
    expect(gamertag()).toHaveAccessibleDescription('Gamertag is already taken.');
    expect(bio()).toHaveAttribute('aria-invalid', 'true');
    expect(bio()).toHaveAccessibleDescription('Bio is too long.');
    expect(screen.queryByText('Second message is not shown.')).toBeNull();
    // Field errors speak for themselves, so no generic alert.
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('moves focus to the first invalid field, in form order', async () => {
    const { user, bio, save } = setup(
      vi.fn(async () => {
        throw validation({ bio: ['Bio contains a blocked word.'] });
      }),
    );
    await user.click(save());
    await waitFor(() => expect(bio()).toHaveFocus());
  });

  it("clears a field's error as soon as the player edits that field (and only that field)", async () => {
    const { user, gamertag, bio, save } = setup(
      vi.fn(async () => {
        throw validation({ gamertag: ['Gamertag is already taken.'], bio: ['Bio is too long.'] });
      }),
    );
    await user.click(save());
    await waitFor(() => expect(gamertag()).toHaveAttribute('aria-invalid', 'true'));

    await user.type(gamertag(), 'x');
    expect(gamertag()).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Gamertag is already taken.')).toBeNull();
    expect(bio()).toHaveAttribute('aria-invalid', 'true');
  });

  it("a 400 with no errors for this form's fields shows the problem's detail (or title) in an alert", async () => {
    const { user, save } = setup(
      vi.fn(async () => {
        throw validation({ region: ['Not available in your region.'] }, { detail: 'Profile changes are paused during maintenance.' });
      }),
    );
    await user.click(save());
    expect(await screen.findByRole('alert')).toHaveTextContent('Profile changes are paused during maintenance.');
  });

  it('409 Conflict -> tells the player to reload', async () => {
    const { user, save } = setup(
      vi.fn(async () => {
        throw new ApiError({ kind: 'http', status: 409, title: 'Conflict' });
      }),
    );
    await user.click(save());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This profile was changed somewhere else. Reload the page to get the latest version.',
    );
  });

  it('network failure -> a connection message', async () => {
    const { user, save } = setup(
      vi.fn(async () => {
        throw new ApiError({ kind: 'network', status: 0 });
      }),
    );
    await user.click(save());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't reach Minecraft.net. Check your connection and try again.",
    );
  });

  it('anything else -> a generic message with the trace ID for support, and the button works again', async () => {
    const { user, save } = setup(
      vi.fn(async () => {
        throw new ApiError({ kind: 'http', status: 500, title: 'Internal Server Error', traceId: '00-7f3a-01' });
      }),
    );
    await user.click(save());
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Try again. (Reference: 00-7f3a-01)');
    expect(save()).toBeEnabled();
  });

  it('a plain JS error (not an ApiError) -> the generic message, without "Reference"', async () => {
    const { user, save } = setup(
      vi.fn(async () => {
        throw new TypeError('boom');
      }),
    );
    await user.click(save());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong. Try again.');
    expect(alert.textContent).not.toMatch(/Reference|boom/);
  });

  it('starting a new save clears the previous error and success messages', async () => {
    const saveProfile = vi
      .fn<(p: Profile) => Promise<Profile>>()
      .mockRejectedValueOnce(new ApiError({ kind: 'network', status: 0 }))
      .mockImplementationOnce(() => new Promise<Profile>(() => {}));
    const { user, save } = setup(saveProfile);
    await user.click(save());
    await screen.findByRole('alert');
    await user.click(save());
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
