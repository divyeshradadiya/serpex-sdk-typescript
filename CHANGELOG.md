# Changelog

## 2.12.0 — 2026-10-23

Types and errors now match the API exactly (checked against the backend and live responses). Minor release: one behaviour change (network errors), otherwise additive; code written for 2.11.0 keeps compiling (`npm run typecheck:compat` checks a 2.11.0 consumer).

**Behaviour change: network errors now throw `SerpApiException`.** A DNS failure, connection reset or TLS error used to reject with the runtime's raw `TypeError` ("fetch failed"). It now rejects with `SerpApiException` (`statusCode` undefined, `details.error === "network"`, `retryable: true`, the original error in `cause`). Code that checked `error instanceof TypeError` should check `error instanceof SerpApiException && error.details?.error === "network"`.

- `SerpApiException` gains `retryable` (429, 5xx, timeout, network), `retryAfterMs` (body, or the `Retry-After` header) and `requestId`. Its message is the API's error text, never `[object Object]`; a status without a body gets a status-specific message.
- New exported types: `SearchStatus`, `SearchResultBase`, `ContentErrorCode`, `ExtractSuccess` / `ExtractFailure` (the exact success and failure shapes), `ExtractErrorType` (now with `dns_unresolved`), `UsageRecentRequest`, `SerpApiErrorBody` (the error body including the framework's object-shaped `error`). `SearchResult`, `SearchMetadata`, `ExtractResult`, `ExtractMetadata`, `UsageStatistics`, `UsageCredits`, `SerpApiError` are now exported from the package root.
- `SearchResult` and `ExtractResult` stay interfaces. `content` / `content_error` are documented as mutually exclusive (both absent on a plain search and beyond the first `content_results` results); `content_error` is typed `ContentErrorCode`, `error_type` `ExtractErrorType`, both open to new strings.
- `SearchMetadata.status` is `SearchStatus | (string & {})`. `UsageResponse.effective_days` added. `recent_requests` is `Array<UsageRecentRequest & Record<string, any>>`: known fields are now typed (they were `any`), so assigning one to a non-optional variable needs a default (`r.status ?? ""`).
- `ExtractParams.stealth` is deprecated: stealth mode ends on 2026-11-01, after which the API answers HTTP 410. `extract({ stealth: true })` logs one `console.warn` per process. `STEALTH_END_DATE` exported.
- New `SerpexClientOptions.userAgent`: a product token appended to the User-Agent (`serpex-js/2.12.0 my-agent/1.4.0`), so integrations built on the SDK stay identifiable.
- Docs: `stealth_provider_unavailable` is never returned (the API drops codes that name its rendering service); such failures carry `error_type: "server_error"`.
- Offline contract tests against sanitized live fixtures (`test/fixtures/`).
- `User-Agent: serpex-js/2.12.0`.

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
