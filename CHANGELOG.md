# Changelog

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
