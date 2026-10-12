import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createStore, shallowEqual, useStore, type Store } from './store';

interface Wallet {
  balance: number;
  cart: string[];
  theme: 'light' | 'dark';
}
const initial = (): Wallet => ({ balance: 1720, cart: [], theme: 'dark' });

describe('7.4 createStore', () => {
  it('getState returns the state; setState merges a partial update into a NEW state object', () => {
    const store = createStore(initial());
    const before = store.getState();
    store.setState({ balance: 820 });
    expect(store.getState()).toEqual({ balance: 820, cart: [], theme: 'dark' });
    expect(store.getState()).not.toBe(before);
    expect(before.balance).toBe(1720); // never mutated
  });

  it('setState accepts an updater function', () => {
    const store = createStore(initial());
    store.setState((s) => ({ cart: [...s.cart, 'Creeper Hoodie'] }));
    store.setState((s) => ({ cart: [...s.cart, 'Warden Costume'] }));
    expect(store.getState().cart).toEqual(['Creeper Hoodie', 'Warden Costume']);
  });

  it('notifies subscribers on change, and stops after they unsubscribe', () => {
    const store = createStore(initial());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setState({ balance: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.setState({ balance: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("doesn't notify (or replace the state) when nothing actually changed", () => {
    const store = createStore(initial());
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getState();
    store.setState({ balance: 1720, theme: 'dark' });
    expect(listener).not.toHaveBeenCalled();
    expect(store.getState()).toBe(before);
  });

  it('works with its methods pulled off the object (no `this` problems)', () => {
    const { getState, setState, subscribe } = createStore(initial());
    const listener = vi.fn();
    subscribe(listener);
    setState({ theme: 'light' });
    expect(getState().theme).toBe('light');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('7.4 shallowEqual', () => {
  it('compares one level deep', () => {
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallowEqual({ a: [] }, { a: [] })).toBe(false); // different arrays
    expect(shallowEqual([1, 2], [1, 2])).toBe(true);
    expect(shallowEqual(3, 3)).toBe(true);
    expect(shallowEqual(null, null)).toBe(true);
    expect(shallowEqual<unknown>(null, {})).toBe(false);
  });
});

describe('7.4 useStore(store, selector, isEqual?)', () => {
  function setup() {
    const store = createStore(initial());
    const renders = { balance: 0, cartCount: 0, summary: 0 };

    function Balance() {
      renders.balance++;
      const balance = useStore(store, (s) => s.balance);
      return <p>Balance: {balance}</p>;
    }
    function CartCount() {
      renders.cartCount++;
      const count = useStore(store, (s) => s.cart.length);
      return <p>Cart: {count}</p>;
    }
    function Summary() {
      renders.summary++;
      const { balance, count } = useStore(store, (s) => ({ balance: s.balance, count: s.cart.length }), shallowEqual);
      return (
        <p>
          Summary: {count} items, {balance} coins
        </p>
      );
    }
    render(
      <>
        <Balance />
        <CartCount />
        <Summary />
      </>,
    );
    const update = (u: Partial<Wallet>) => act(() => store.setState(u));
    return { store, renders, update };
  }

  it('renders the selected values', () => {
    setup();
    expect(screen.getByText('Balance: 1720')).toBeInTheDocument();
    expect(screen.getByText('Cart: 0')).toBeInTheDocument();
    expect(screen.getByText('Summary: 0 items, 1720 coins')).toBeInTheDocument();
  });

  it('re-renders a component when its slice changes', async () => {
    const { update } = setup();
    await update({ balance: 820 });
    expect(screen.getByText('Balance: 820')).toBeInTheDocument();
    expect(screen.getByText('Summary: 0 items, 820 coins')).toBeInTheDocument();
  });

  it("does NOT re-render a component when a slice it doesn't select changes", async () => {
    const { update, renders } = setup();
    const before = { ...renders };
    await update({ theme: 'light' });
    expect(renders).toEqual(before);

    await update({ cart: ['Creeper Hoodie'] });
    expect(screen.getByText('Cart: 1')).toBeInTheDocument();
    expect(renders.balance).toBe(before.balance);
    expect(renders.cartCount).toBe(before.cartCount + 1);
  });

  it('an object selector with shallowEqual re-renders only when one of its fields changes', async () => {
    const { update, renders } = setup();
    const before = renders.summary;
    await update({ theme: 'light' });
    await update({ cart: [] }); // a new (empty) array: the length is still 0
    expect(renders.summary).toBe(before);
    await update({ cart: ['Allay Wings', 'Frog Prince'] });
    expect(renders.summary).toBe(before + 1);
    expect(screen.getByText('Summary: 2 items, 1720 coins')).toBeInTheDocument();
  });

  it("doesn't loop forever when a selector returns a new object and no isEqual is given", async () => {
    const store = createStore(initial());
    function Unsafe() {
      const view = useStore(store, (s) => ({ coins: s.balance }));
      return <p>Coins: {view.coins}</p>;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Unsafe />);
    await act(() => store.setState({ balance: 5 }));
    spy.mockRestore();
    expect(screen.getByText('Coins: 5')).toBeInTheDocument();
  });

  it('a selector that depends on props picks up the new prop', () => {
    const store = createStore(initial());
    store.setState({ cart: ['Creeper Hoodie', 'Warden Costume'] });
    function InCart({ item }: { item: string }) {
      const inCart = useStore(store, (s) => s.cart.includes(item));
      return <p>{inCart ? `${item} is in your cart` : `${item} is not in your cart`}</p>;
    }
    const view = render(<InCart item="Creeper Hoodie" />);
    expect(screen.getByText('Creeper Hoodie is in your cart')).toBeInTheDocument();
    view.rerender(<InCart item="Panda Hoodie" />);
    expect(screen.getByText('Panda Hoodie is not in your cart')).toBeInTheDocument();
  });

  it('unsubscribes when the component unmounts', () => {
    const base = createStore(initial());
    const unsubscribed = vi.fn();
    const subscribe: Store<Wallet>['subscribe'] = (listener) => {
      const off = base.subscribe(listener);
      return () => {
        unsubscribed();
        off();
      };
    };
    const store: Store<Wallet> = { ...base, subscribe };
    function Balance() {
      return <p>{useStore(store, (s) => s.balance)}</p>;
    }
    const view = render(<Balance />);
    view.unmount();
    expect(unsubscribed).toHaveBeenCalledTimes(1);
  });
});
