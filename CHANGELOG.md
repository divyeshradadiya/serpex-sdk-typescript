# Changelog

## 2.11.1 — 2026-10-23

Types and errors now match the API exactly (checked against the backend and live responses).

- `SearchResult` is a union: `content` and `content_error` are mutually exclusive, and both are absent on a plain search and beyond the first `content_results` results. `SearchResultBase` is exported for `extends` (code that did `interface X extends SearchResult` must extend `SearchResultBase` now; reading fields is unchanged). `content_error` is typed `ContentErrorCode`.
- `ExtractResult` is a union on `success`: `ExtractSuccess` (`markdown` or `html`) or `ExtractFailure` (`error` and `error_type` always set, never charged). `error_type` is typed `ExtractErrorType` and now includes `dns_unresolved`.
- `SearchMetadata.status` is `"success" | "no_results"`. `UsageResponse.effective_days` added; `recent_requests` typed as `UsageRecentRequest[]`. `SerpApiError` describes the real error bodies (`retryAfterMs`, `limit`, `remainingCredits`, `request_id`, `retryable`, `invalid_urls`).
- `SerpApiException` gains `retryable`, `retryAfterMs` (body, or the `Retry-After` header) and `requestId`. Its message is the API's error text, never `[object Object]`; a status without a body gets a status-specific message. Network failures (DNS, reset, TLS) are now thrown as `SerpApiException` too (`details.error === "network"`, `retryable: true`, original error in `cause`), not as a raw `TypeError`.
- `ExtractParams.stealth` is deprecated: stealth mode ends on 2026-11-01, after which the API answers HTTP 410. `extract({ stealth: true })` logs one `console.warn` per process. `STEALTH_END_DATE` exported.
- Docs: `stealth_provider_unavailable` is never returned (the API drops codes that name its rendering service); such failures carry `error_type: "server_error"`.
- Offline contract tests against sanitized live fixtures (`test/fixtures/`).
- New `SerpexClientOptions.userAgent`: a product token appended to the User-Agent (`serpex-js/2.11.1 my-agent/1.4.0`), so integrations built on the SDK stay identifiable.
- `User-Agent: serpex-js/2.11.1`.

## 2.11.0 — 2026-10-01

- `search()` sends only `q`, plus `include_content` / `content_results` when set. `engine` / `engines` (and any other option the API ignores) are still accepted, never sent, and log one `console.warn` per process.
- Types: `SearchResponse.engines` and `SearchResult.engine` optional and deprecated (always "auto"). Added `SearchResponse.message`, `metadata.no_results_verified` / `charged` / `message` (no-results only), `ExtractMetadata.stealth`, `UsageStatistics.noResultsRequests`, `SearchParams.engines` (deprecated). `ExtractResult.crawled_at` / `extraction_mode` deprecated (never returned).
- Per-call timeouts via AbortController: search 60 s, search with include_content 100 s, extract 100 s, stealth extract 120 s; override with `new SerpexClient(key, baseUrl, { timeoutMs })`. A timeout throws `SerpApiException` (`details.error === "timeout"`).
- `User-Agent: serpex-js/2.11.0` on every request; `VERSION` exported.
- `usage()` docs: counts and balance cover the whole organization; `api_key` is the key's name.

## 2.10.3 — 2026-09-22

- docs: positioning — Serpex is a real-time web search API with page content extraction (`extract`).
- `engine` deprecated (ignored by the API since 2026-06). `SearchParams.engine` is accepted again as an optional, deprecated field so code written for older versions compiles; the SDK does not send it. No methods, exports or response fields changed.
- Removed stale live-API scripts (`simple-test.ts`, `test-news.ts`, `test-sdk.ts`); added offline unit tests (`test/`).
- package description and keywords updated.
