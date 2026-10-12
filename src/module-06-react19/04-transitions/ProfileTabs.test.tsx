import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { ProfileTabs, type TabId } from './ProfileTabs';

let leftovers: ReturnType<typeof deferred<string>>[] = [];
afterEach(async () => {
  await act(async () => {
    for (const d of leftovers) d.resolve('');
  });
  leftovers = [];
});

function setup() {
  const d = { overview: deferred<string>(), skins: deferred<string>(), achievements: deferred<string>() };
  leftovers.push(...Object.values(d));
  const resources = { overview: d.overview.promise, skins: d.skins.promise, achievements: d.achievements.promise };
  render(<ProfileTabs resources={resources} />);
  const load = (tab: TabId, text: string) => act(async () => d[tab].resolve(text));
  const tab = (name: string) => screen.getByRole('tab', { name });
  const panel = () => screen.getByRole('tabpanel');
  return { user: userEvent.setup(), load, tab, panel };
}

describe('6.4 ProfileTabs (useTransition + Suspense)', () => {
  it('renders an accessible tab list, with Overview selected and the panel labelled by it', () => {
    const { tab, panel } = setup();
    expect(screen.getByRole('tablist', { name: 'Profile sections' })).toBeInTheDocument();
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Skins')).toHaveAttribute('aria-selected', 'false');
    expect(tab('Achievements')).toHaveAttribute('aria-selected', 'false');
    expect(panel()).toHaveAttribute('aria-labelledby', tab('Overview').id);
    expect(tab('Overview')).toHaveAttribute('aria-controls', panel().id);
  });

  it('shows the Suspense fallback on the very first load, then the content', async () => {
    const { load, panel } = setup();
    expect(panel()).toHaveTextContent('Loading…');
    await load('overview', 'Alex_Builds has played 412 hours.');
    expect(await screen.findByText('Alex_Builds has played 412 hours.')).toBeInTheDocument();
  });

  it('keeps showing the current tab (no spinner) while the next one loads, and marks the panel aria-busy', async () => {
    const { user, load, tab, panel } = setup();
    await load('overview', 'Alex_Builds has played 412 hours.');
    await screen.findByText('Alex_Builds has played 412 hours.');

    await user.click(tab('Achievements'));
    await waitFor(() => expect(panel()).toHaveAttribute('aria-busy', 'true'));
    expect(screen.getByText('Alex_Builds has played 412 hours.')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).toBeNull();

    await load('achievements', 'The End? (Free the End)');
    expect(await screen.findByText('The End? (Free the End)')).toBeInTheDocument();
    expect(tab('Achievements')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'false');
    expect(panel()).not.toHaveAttribute('aria-busy', 'true');
    expect(panel()).toHaveAttribute('aria-labelledby', tab('Achievements').id);
  });

  it('switching back to a tab that already loaded is instant', async () => {
    const { user, load, tab, panel } = setup();
    await load('overview', 'Overview text');
    await load('skins', 'Skins text');
    await screen.findByText('Overview text');
    await user.click(tab('Skins'));
    expect(await screen.findByText('Skins text')).toBeInTheDocument();
    await user.click(tab('Overview'));
    expect(screen.getByText('Overview text')).toBeInTheDocument();
    expect(panel()).not.toHaveAttribute('aria-busy', 'true');
  });

  it('if the player clicks a second tab while the first is loading, the last click wins', async () => {
    const { user, load, tab } = setup();
    await load('overview', 'Overview text');
    await screen.findByText('Overview text');
    await user.click(tab('Skins'));
    await user.click(tab('Achievements'));
    await load('achievements', 'Achievements text');
    await load('skins', 'Skins text');
    expect(await screen.findByText('Achievements text')).toBeInTheDocument();
    expect(tab('Achievements')).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Skins text')).toBeNull();
  });
});
