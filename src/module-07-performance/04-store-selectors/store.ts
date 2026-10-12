// 7.4 createStore + useStore. The spec is in README.md in this folder.
import { useRef, useSyncExternalStore } from 'react';

export interface Store<T> {
  getState: () => T;
  setState: (update: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T extends object>(initialState: T): Store<T> {
  // TODO
  return {
    getState: () => initialState,
    setState: () => {},
    subscribe: () => () => {},
  };
}

export function shallowEqual<A>(a: A, b: A): boolean {
  // TODO
  return Object.is(a, b);
}

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S, isEqual: (a: S, b: S) => boolean = Object.is): S {
  // TODO: useSyncExternalStore, but the snapshot is the *selection*. Read the README's warning first.
  return selector(store.getState());
}
