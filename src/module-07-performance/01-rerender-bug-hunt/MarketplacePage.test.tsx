import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MarketplacePage } from './MarketplacePage';
import { perf } from './perfTracker';
import { SKINS } from './skins.fixture';

function setup() {
  const user = userEvent.setup();
  render(<MarketplacePage skins={SKINS} />);
  const cards = () => within(screen.getByRole('list', { name: 'Skins' })).getAllByRole('listitem');
  const wishlist = (name: string) => screen.getByRole('button', { name: `Wishlist ${name}` });
  const details = (name: string) => screen.getByRole('button', { name: `Details ${name}` });
  return {
    user,
    cards,
    wishlist,
    details,
    search: () => screen.getByRole('searchbox', { name: 'Search skins' }),
    gift: () => screen.getByRole('textbox', { name: 'Gift message' }),
  };
}

describe('7.1 Bug hunt: slow Marketplace page', () => {
  describe('still works', () => {
    it('lists every skin, most popular first, and filters by search', async () => {
      const { user, cards, search } = setup();
      expect(cards()).toHaveLength(SKINS.length);
      const mostPopular = [...SKINS].sort((a, b) => b.popularity - a.popularity)[0]!;
      expect(within(cards()[0]!).getByRole('heading')).toHaveTextContent(mostPopular.name);
      await user.type(search(), 'creeper');
      expect(cards().map((li) => within(li).getByRole('heading').textContent).sort()).toEqual(
        ['Creeper Hoodie', 'Creeper Ninja', 'Creeper Pajamas'],
      );
    });

    it('toggles the wishlist (two different skins in a row both stick) and counts it', async () => {
      const { user, wishlist } = setup();
      await user.click(wishlist('Warden Costume'));
      await user.click(wishlist('Allay Wings'));
      expect(wishlist('Warden Costume')).toHaveAttribute('aria-pressed', 'true');
      expect(wishlist('Allay Wings')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('2 on your wishlist')).toBeInTheDocument();
      await user.click(wishlist('Warden Costume'));
      expect(wishlist('Warden Costume')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('1 on your wishlist')).toBeInTheDocument();
    });
  });

  describe('the correctness bug', () => {
    it('an open "Details" panel stays with its skin when the list is filtered', async () => {
      const { user, details, search, cards } = setup();
      await user.click(details('Creeper Ninja'));
      expect(details('Creeper Ninja')).toHaveAttribute('aria-expanded', 'true');

      await user.type(search(), 'creeper');
      expect(details('Creeper Ninja')).toHaveAttribute('aria-expanded', 'true');
      const open = cards().filter((li) => within(li).getAllByRole('button')[1]!.getAttribute('aria-expanded') === 'true');
      expect(open).toHaveLength(1);
      expect(screen.getByText('Creeper Ninja: a fan favorite from the Marketplace.')).toBeInTheDocument();
    });
  });

  describe('the performance bugs', () => {
    it('typing a gift message re-renders no skin cards, and does not re-sort', async () => {
      const { user, gift } = setup();
      perf.reset();
      await user.type(gift(), 'Happy birthday!');
      expect(perf.cardRenders()).toBe(0);
      expect(perf.sorts()).toBe(0);
    });

    it('toggling the wishlist on one skin re-renders only that card', async () => {
      const { user, wishlist } = setup();
      perf.reset();
      await user.click(wishlist('Warden Costume'));
      const warden = SKINS.find((s) => s.name === 'Warden Costume')!;
      expect(perf.cardRenders(warden.id)).toBe(1);
      expect(perf.cardRenders()).toBe(1);
    });

    it('typing a search re-renders none of the cards that stay visible, and does not re-sort', async () => {
      const { user, search } = setup();
      perf.reset();
      await user.type(search(), 'creeper');
      expect(perf.cardRenders()).toBe(0);
      expect(perf.sorts()).toBe(0);
    });

    it('sorts exactly once on mount', () => {
      perf.reset();
      setup();
      expect(perf.sorts()).toBe(1);
    });
  });
});
