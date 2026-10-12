// 5.2 withRetry. The spec is in README.md in this folder.
import { ApiError } from '../ApiError';

export interface RetryOptions {
  /** How many times to retry after the first attempt. Default 3 (so up to 4 attempts). */
  retries?: number;
  /** Backoff starting point. Default 200. */
  baseDelayMs?: number;
  /** No single wait is longer than this. Default 5000. */
  maxDelayMs?: number;
  signal?: AbortSignal;
  /** Default: isRetryable */
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
  /** Injected so tests don't actually wait. Default: defaultSleep */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  /** Injected so tests can make the jitter predictable. Default: Math.random */
  random?: () => number;
}

export function isRetryable(error: unknown): boolean {
  // TODO
  void ApiError;
  return false;
}

/** Waits `ms`, but rejects early with an AbortError if `signal` aborts. */
export function defaultSleep(ms: number, signal?: AbortSignal): Promise<void> {
  // TODO: setTimeout + the signal's 'abort' event (and clean up whichever one doesn't fire)
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  // TODO: build it!
  return operation(0);
}
