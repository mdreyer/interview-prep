// Small helpers shared by the Module 2 tests. You don't need to edit this file.
import { act } from '@testing-library/react';

/** Wait for real time to pass, letting React process any updates that happen meanwhile. */
export function wait(ms: number) {
  return act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));
}

/** A promise you can resolve or reject from the outside, so tests control exactly when a "request" finishes. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
