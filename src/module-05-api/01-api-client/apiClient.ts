// 5.1 apiClient. The spec is in README.md in this folder.
import { ApiError, type ProblemDetails } from '../ApiError';

export type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  idempotencyKey?: string;
}

export interface ApiClientConfig {
  baseUrl: string;
  /** Injected so tests (and SSR) can supply their own. In the app, pass `window.fetch.bind(window)`. */
  fetch: typeof fetch;
  getAccessToken?: () => Promise<string | null> | string | null;
  onUnauthorized?: () => void;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClient {
  request<T>(method: HttpMethod, path: string, options?: RequestOptions): Promise<T>;
}

/** "Gamertag" -> "gamertag", "Address.PostalCode" -> "address.postalCode" */
export function toCamelPath(key: string): string {
  // TODO
  return key;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    // TODO: build it! (These lines just keep the imports "used" until you do.)
    void ApiError;
    const problem: ProblemDetails = {};
    void problem;
    throw new Error('Not implemented');
  }

  return { request };
}
