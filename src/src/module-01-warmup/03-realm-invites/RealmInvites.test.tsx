import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RealmInvites, type Friend } from './RealmInvites';
import { FRIENDS } from './friends.fixture';

function frozenFriends(): readonly Friend[] {
  return Object.freeze(FRIENDS.map((f) => Object.freeze({ ...f })));
}

function setup(maxInvites?: number) {
  const onSendInvites = vi.fn();
  const user = userEvent.setup();
  render(
    <RealmInvites friends={frozenFriends()} maxInvites={maxInvites} onSendInvites={onSendInvites} />,
  );
  return { user, onSendInvites };
}

const friendRows = () => within(screen.getByRole('list', { name: 'Friends' })).getAllByRole('listitem');
const inviteRows = () =>
  within(screen.getByRole('list', { name: 'Pending invites' })).getAllByRole('listitem');

describe('1.3 RealmInvites', () => {
  it('renders without mutating the (frozen) friends prop', () => {
    expect(() => setup()).not.toThrow();
    expect(friendRows()).toHaveLength(6);
  });

  it('sorts online friends first, then case-insensitive alphabetical', () => {
    setup();
    const expected = ['blockhead', 'Creeper_Kid', 'Ender_Ella', 'moss_mason', 'Nether_Nate', 'zuri_crafts'];
    const rows = friendRows();
    expected.forEach((name, i) => expect(rows[i]).toHaveTextContent(name));
  });

  it('filters by case-insensitive substring and shows an empty message', async () => {
    const { user } = setup();
    const search = screen.getByRole('searchbox', { name: 'Search friends' });
    await user.type(search, 'ER');
    const rows = friendRows();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Creeper_Kid');
    expect(rows[1]).toHaveTextContent('Ender_Ella');
    expect(rows[2]).toHaveTextContent('Nether_Nate');

    await user.clear(search);
    await user.type(search, 'herobrine');
    expect(screen.getByText('No friends match "herobrine".')).toBeInTheDocument();
  });

  it('starts with no invites and a disabled Send button', () => {
    setup();
    expect(screen.getByText('No invites yet.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Pending invites' })).not.toBeInTheDocument();
    expect(screen.getByText('0 of 10 invites')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send invites' })).toBeDisabled();
  });

  it('adds invites in the order they were made and disables re-inviting', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Invite zuri_crafts' }));
    await user.click(screen.getByRole('button', { name: 'Invite blockhead' }));

    const rows = inviteRows();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('zuri_crafts');
    expect(rows[1]).toHaveTextContent('blockhead');
    expect(screen.getByRole('button', { name: 'Invite zuri_crafts' })).toBeDisabled();
    expect(screen.getByText('2 of 10 invites')).toBeInTheDocument();
    expect(screen.queryByText('No invites yet.')).not.toBeInTheDocument();
  });

  it('keeps pending invites when the search hides those friends', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Invite moss_mason' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search friends' }), 'ender');
    expect(friendRows()).toHaveLength(1);
    expect(inviteRows()).toHaveLength(1);
    expect(inviteRows()[0]).toHaveTextContent('moss_mason');
  });

  it('removes an invite and re-enables that friend', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Invite Ender_Ella' }));
    await user.click(screen.getByRole('button', { name: 'Invite Nether_Nate' }));
    await user.click(screen.getByRole('button', { name: 'Remove Ender_Ella' }));

    expect(inviteRows()).toHaveLength(1);
    expect(inviteRows()[0]).toHaveTextContent('Nether_Nate');
    expect(screen.getByRole('button', { name: 'Invite Ender_Ella' })).toBeEnabled();
  });

  it('enforces maxInvites', async () => {
    const { user } = setup(2);
    await user.click(screen.getByRole('button', { name: 'Invite blockhead' }));
    await user.click(screen.getByRole('button', { name: 'Invite Creeper_Kid' }));

    expect(screen.getByText('2 of 2 invites')).toBeInTheDocument();
    expect(screen.getByText('Invite limit reached')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite zuri_crafts' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Remove blockhead' }));
    expect(screen.queryByText('Invite limit reached')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite zuri_crafts' })).toBeEnabled();
  });

  it('sends ids in invite order and then clears the list', async () => {
    const { user, onSendInvites } = setup();
    await user.click(screen.getByRole('button', { name: 'Invite Nether_Nate' }));
    await user.click(screen.getByRole('button', { name: 'Invite Creeper_Kid' }));
    await user.click(screen.getByRole('button', { name: 'Invite zuri_crafts' }));
    await user.click(screen.getByRole('button', { name: 'Send invites' }));

    expect(onSendInvites).toHaveBeenCalledTimes(1);
    expect(onSendInvites).toHaveBeenCalledWith(['u4', 'u2', 'u1']);
    expect(screen.getByText('No invites yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send invites' })).toBeDisabled();
  });
});
