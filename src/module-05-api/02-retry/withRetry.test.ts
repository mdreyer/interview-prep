import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../ApiError';
import { isRetryable, withRetry } from './withRetry';

const http = (status: number, retryAfterMs?: number) => new ApiError({ kind: 'http', status, retryAfterMs });
const network = () => new ApiError({ kind: 'network', status: 0 });

/** An operation that fails with each given error in turn, then succeeds with `result`. */
function failingThen<T>(errors: unknown[], result: T) {
  const queue = [...errors];
  return vi.fn(async (_attempt: number) => {
    const next = queue.shift();
    if (next !== undefined) throw next;
    return result;
  });
}

const instantSleep = () => vi.fn(async (_ms: number, _signal?: AbortSignal) => {});
const delays = (sleep: ReturnType<typeof instantSleep>) => sleep.mock.calls.map((c) => c[0]);

async function caught(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('expected a rejection, but it resolved');
}

describe('5.2 withRetry', () => {
  it('returns the result on the first try without sleeping', async () => {
    const op = failingThen([], 'ok');
    const sleep = instantSleep();
    await expect(withRetry(op, { sleep })).resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
    expect(op).toHaveBeenCalledWith(0);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('retries a network error, then succeeds (passing the attempt number each time)', async () => {
    const op = failingThen([network(), http(503)], { balance: 1720 });
    await expect(withRetry(op, { sleep: instantSleep(), random: () => 1 })).resolves.toEqual({ balance: 1720 });
    expect(op.mock.calls.map((c) => c[0])).toEqual([0, 1, 2]);
  });

  it('gives up after `retries` retries (default 3, so 4 attempts) and throws the last error', async () => {
    const last = http(502);
    const op = failingThen([network(), http(500), http(503), last, http(500)], 'never');
    const error = await caught(withRetry(op, { sleep: instantSleep(), random: () => 1 }));
    expect(error).toBe(last);
    expect(op).toHaveBeenCalledTimes(4);
  });

  it('backs off exponentially from baseDelayMs (default 200), capped at maxDelayMs', async () => {
    const sleep = instantSleep();
    await caught(withRetry(failingThen([network(), network(), network(), network()], 'x'), { sleep, random: () => 1 }));
    expect(delays(sleep)).toEqual([200, 400, 800]);

    const capped = instantSleep();
    await caught(
      withRetry(failingThen([network(), network(), network(), network()], 'x'), {
        sleep: capped,
        random: () => 1,
        baseDelayMs: 1000,
        maxDelayMs: 3000,
      }),
    );
    expect(delays(capped)).toEqual([1000, 2000, 3000]);
  });

  it('uses "full jitter": the delay is random() × the backoff ceiling', async () => {
    const sleep = instantSleep();
    await caught(withRetry(failingThen([network(), network(), network(), network()], 'x'), { sleep, random: () => 0.5 }));
    expect(delays(sleep)).toEqual([100, 200, 400]);
  });

  it("never retries client errors (400, 404, 409) or errors that aren't ApiErrors", async () => {
    for (const error of [http(400), http(404), http(409), new TypeError("Cannot read properties of undefined (reading 'id')")]) {
      const op = failingThen([error], 'never');
      const sleep = instantSleep();
      expect(await caught(withRetry(op, { sleep }))).toBe(error);
      expect(op).toHaveBeenCalledTimes(1);
      expect(sleep).not.toHaveBeenCalled();
    }
  });

  it("respects the server's Retry-After (retryAfterMs) instead of its own backoff, still capped by maxDelayMs", async () => {
    const sleep = instantSleep();
    await withRetry(failingThen([http(429, 2500), http(503, 60_000)], 'ok'), { sleep, random: () => 1, maxDelayMs: 10_000 });
    expect(delays(sleep)).toEqual([2500, 10_000]);
  });

  it('reports each retry through onRetry({ attempt, delayMs, error })', async () => {
    const onRetry = vi.fn();
    const first = network();
    await withRetry(failingThen([first], 'ok'), { sleep: instantSleep(), random: () => 1, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith({ attempt: 1, delayMs: 200, error: first });
  });

  it('lets callers override the policy with shouldRetry', async () => {
    const op = failingThen([http(404), http(404)], 'found it');
    await expect(withRetry(op, { sleep: instantSleep(), shouldRetry: () => true })).resolves.toBe('found it');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('stops immediately when the signal aborts while waiting (using the default sleep)', async () => {
    const controller = new AbortController();
    const op = failingThen([network(), network()], 'never');
    const promise = withRetry(op, { signal: controller.signal, baseDelayMs: 5000, random: () => 1 });
    setTimeout(() => controller.abort(), 20);
    const started = Date.now();
    const error = await caught(promise);
    expect(Date.now() - started).toBeLessThanOrEqual(1000);
    expect((error as Error).name).toBe('AbortError');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("doesn't even start when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const op = failingThen([], 'never');
    const error = await caught(withRetry(op, { signal: controller.signal, sleep: instantSleep() }));
    expect((error as Error).name).toBe('AbortError');
    expect(op).not.toHaveBeenCalled();
  });

  it('isRetryable: network, 408, 429 and 5xx gateway/availability errors only', () => {
    expect(isRetryable(network())).toBe(true);
    for (const status of [408, 429, 500, 502, 503, 504]) expect(isRetryable(http(status))).toBe(true);
    for (const status of [400, 401, 403, 404, 409, 422]) expect(isRetryable(http(status))).toBe(false);
    expect(isRetryable(new DOMException('Aborted', 'AbortError'))).toBe(false);
    expect(isRetryable('nope')).toBe(false);
  });
});
