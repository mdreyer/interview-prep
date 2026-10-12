// Shared by every Module 5 problem. You don't need to edit this file.

/**
 * ASP.NET Core's error body (RFC 9457 "problem details"). `ValidationProblemDetails` adds `errors`,
 * keyed by the C# property path: `{ "Gamertag": ["Gamertag is taken."], "Address.PostalCode": ["Required."] }`.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export type ApiErrorKind = 'http' | 'network';

export interface ApiErrorInit {
  kind: ApiErrorKind;
  /** HTTP status code, or 0 when the request never got a response (network failure). */
  status: number;
  message?: string;
  title?: string;
  detail?: string;
  traceId?: string;
  /** Field errors with camelCase keys, ready for the UI: `{ gamertag: ['Gamertag is taken.'] }`. */
  fieldErrors?: Record<string, string[]>;
  /** From the `Retry-After` response header, converted to milliseconds. */
  retryAfterMs?: number;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly title?: string;
  readonly detail?: string;
  readonly traceId?: string;
  readonly fieldErrors: Record<string, string[]>;
  readonly retryAfterMs?: number;

  constructor(init: ApiErrorInit) {
    super(init.message ?? init.title ?? `Request failed with status ${init.status}`);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.status = init.status;
    this.title = init.title;
    this.detail = init.detail;
    this.traceId = init.traceId;
    this.fieldErrors = init.fieldErrors ?? {};
    this.retryAfterMs = init.retryAfterMs;
  }
}
