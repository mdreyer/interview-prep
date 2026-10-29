import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ServerList, type Server } from './ServerList';

const SERVERS: Server[] = [
  { id: 1, name: 'Skyblock Isles', address: 'sky.example.net' },
  { id: 2, name: 'Creative Plots', address: 'build.example.org' },
  { id: 3, name: 'Parkour Peak', address: 'parkour.example.com' },
];

function setup() {
  const user = userEvent.setup();
  // Pass a copy so a mutating implementation can't leak between tests.
  render(<ServerList initialServers={SERVERS.map((s) => ({ ...s }))} />);
  return { user };
}

const rows = () => within(screen.getByRole('list', { name: 'Servers' })).getAllByRole('listitem');
const notes = (name: string) => screen.getByRole('textbox', { name: `Notes for ${name}` });

async function addServer(user: ReturnType<typeof userEvent.setup>, name: string, address: string) {
  await user.type(screen.getByRole('textbox', { name: 'Server name' }), name);
  await user.type(screen.getByRole('textbox', { name: 'Server address' }), address);
  await user.click(screen.getByRole('button', { name: 'Add server' }));
}

describe('1.4 ServerList (bug hunt)', () => {
  it('renders the initial servers and count', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Favorite servers (3)' })).toBeInTheDocument();
    expect(rows()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Move Skyblock Isles up' })).toBeDisabled();
  });

  it('requires BOTH name and address before Add is enabled', async () => {
    const { user } = setup();
    const add = screen.getByRole('button', { name: 'Add server' });
    expect(add).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'Server name' }), 'Lonely Name');
    expect(add).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'Server address' }), '   ');
    expect(add).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'Server address' }), 'lonely.example.net');
    expect(add).toBeEnabled();
  });

  it('adds a server, updates the count, and clears the form', async () => {
    const { user } = setup();
    await addServer(user, 'Spleef Arena', 'spleef.example.net');
    expect(rows()).toHaveLength(4);
    expect(rows()[3]).toHaveTextContent('Spleef Arena');
    expect(screen.getByRole('heading', { name: 'Favorite servers (4)' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Server name' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Server address' })).toHaveValue('');
  });

  it('moves a server up', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Move Parkour Peak up' }));
    expect(rows()[1]).toHaveTextContent('Parkour Peak');
    expect(rows()[2]).toHaveTextContent('Creative Plots');
  });

  it('keeps each note attached to its own server when moving rows', async () => {
    const { user } = setup();
    await user.type(notes('Creative Plots'), 'great redstone builds');
    await user.click(screen.getByRole('button', { name: 'Move Creative Plots up' }));
    expect(rows()[0]).toHaveTextContent('Creative Plots');
    expect(notes('Creative Plots')).toHaveValue('great redstone builds');
    expect(notes('Skyblock Isles')).toHaveValue('');
  });

  it('keeps each note attached to its own server when removing rows', async () => {
    const { user } = setup();
    await user.type(notes('Parkour Peak'), 'hard mode');
    await user.click(screen.getByRole('button', { name: 'Remove Skyblock Isles' }));
    expect(screen.getByRole('heading', { name: 'Favorite servers (2)' })).toBeInTheDocument();
    expect(notes('Parkour Peak')).toHaveValue('hard mode');
    expect(notes('Creative Plots')).toHaveValue('');
  });

  it('gives new servers unique ids even after removals', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Remove Skyblock Isles' }));
    await addServer(user, 'Spleef Arena', 'spleef.example.net');
    expect(rows()).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Remove Spleef Arena' }));
    expect(rows()).toHaveLength(2);
    expect(screen.getByText('Parkour Peak')).toBeInTheDocument();
  });
});
