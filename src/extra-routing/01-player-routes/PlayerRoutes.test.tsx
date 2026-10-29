import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PlayerRoutes } from './PlayerRoutes';

/** Test helper: shows the current path, and acts like the browser's Back button. */
function BrowserChrome() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="location">{location.pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>
        Browser back
      </button>
    </>
  );
}

/** Start the app as if the player had opened `entries[index]` (the earlier entries are history they can go Back to). */
function renderAt(entries: string[], index = entries.length - 1) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <PlayerRoutes />
      <BrowserChrome />
    </MemoryRouter>,
  );
  const sections = () => screen.getByRole('navigation', { name: 'Profile sections' });
  return {
    user,
    path: () => screen.getByTestId('location').textContent,
    back: () => user.click(screen.getByRole('button', { name: 'Browser back' })),
    link: (name: string) => within(sections()).getByRole('link', { name }),
  };
}

describe('R.1 Player profile routes (React Router)', () => {
  describe('reading the URL', () => {
    it('a deep link renders the right player and section, with that section marked as current', () => {
      const { link } = renderAt(['/players/Steve/skins']);
      expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeInTheDocument();
      expect(screen.getByText(/Steve's skins/)).toBeInTheDocument();
      expect(link('Skins')).toHaveAttribute('aria-current', 'page');
      expect(link('Overview')).not.toHaveAttribute('aria-current');
      expect(link('Achievements')).not.toHaveAttribute('aria-current');
    });

    it('the section links are real links, with hrefs you could copy or open in a new tab', () => {
      const { link } = renderAt(['/players/Steve/overview']);
      expect(link('Overview')).toHaveAttribute('href', '/players/Steve/overview');
      expect(link('Skins')).toHaveAttribute('href', '/players/Steve/skins');
      expect(link('Achievements')).toHaveAttribute('href', '/players/Steve/achievements');
    });

    it('/players/:username on its own redirects to the overview', () => {
      const { path } = renderAt(['/players/Alex']);
      expect(path()).toBe('/players/Alex/overview');
      expect(screen.getByText(/Alex's overview/)).toBeInTheDocument();
    });

    it("the redirect replaces the history entry, so Back doesn't bounce the player straight back into it", async () => {
      const { path, back } = renderAt(['/home', '/players/Alex']);
      expect(path()).toBe('/players/Alex/overview');
      await back();
      expect(path()).toBe('/home');
    });

    it('an unknown section says so, and links back to the overview', () => {
      renderAt(['/players/Steve/emotes']);
      expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Unknown section "emotes".');
      expect(screen.getByRole('link', { name: 'Go to the overview' })).toHaveAttribute('href', '/players/Steve/overview');
    });

    it('any other URL shows "Page not found"', () => {
      renderAt(['/marketplace/whatever']);
      expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    });
  });

  describe('writing the URL', () => {
    it('clicking a section link updates the URL, the content and the current marker', async () => {
      const { user, path, link } = renderAt(['/players/Steve/overview']);
      await user.click(link('Achievements'));
      expect(path()).toBe('/players/Steve/achievements');
      expect(screen.getByText(/Steve's achievements/)).toBeInTheDocument();
      expect(link('Achievements')).toHaveAttribute('aria-current', 'page');
      expect(link('Overview')).not.toHaveAttribute('aria-current');
    });

    it('each section change is a history entry: Back returns to the previous section', async () => {
      const { user, path, back, link } = renderAt(['/players/Steve/overview']);
      await user.click(link('Skins'));
      await user.click(link('Achievements'));
      await back();
      expect(path()).toBe('/players/Steve/skins');
      expect(screen.getByText(/Steve's skins/)).toBeInTheDocument();
      expect(link('Skins')).toHaveAttribute('aria-current', 'page');
    });

    it('"Go to player" switches player and keeps the current section', async () => {
      const { user, path } = renderAt(['/players/Steve/skins']);
      await user.type(screen.getByRole('textbox', { name: 'Go to player' }), 'Alex');
      await user.click(screen.getByRole('button', { name: 'Go' }));
      expect(path()).toBe('/players/Alex/skins');
      expect(screen.getByRole('heading', { level: 1, name: 'Alex' })).toBeInTheDocument();
      expect(screen.getByText(/Alex's skins/)).toBeInTheDocument();
    });

    it('"Go to player" encodes the name in the URL, and the page shows it decoded', async () => {
      const { user, path, link } = renderAt(['/players/Steve/achievements']);
      await user.type(screen.getByRole('textbox', { name: 'Go to player' }), '  Mr Redstone  {Enter}');
      expect(path()).toBe('/players/Mr%20Redstone/achievements');
      expect(screen.getByRole('heading', { level: 1, name: 'Mr Redstone' })).toBeInTheDocument();
      expect(link('Skins')).toHaveAttribute('href', '/players/Mr%20Redstone/skins');
    });

    it('"Go to player" ignores a blank name, and from an unknown section it lands on the overview', async () => {
      const { user, path } = renderAt(['/players/Steve/emotes']);
      const input = screen.getByRole('textbox', { name: 'Go to player' });
      await user.type(input, '   {Enter}');
      expect(path()).toBe('/players/Steve/emotes');
      await user.clear(input);
      await user.type(input, 'Alex{Enter}');
      expect(path()).toBe('/players/Alex/overview');
    });
  });
});
