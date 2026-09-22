# Changelog

## 2.10.3 — 2026-09-22

- docs: positioning — Serpex is a real-time web search API with page content extraction (`extract`).
- `engine` deprecated (ignored by the API since 2026-06). `SearchParams.engine` is accepted again as an optional, deprecated field so code written for older versions compiles; the SDK does not send it. No methods, exports or response fields changed.
- Removed stale live-API scripts (`simple-test.ts`, `test-news.ts`, `test-sdk.ts`); added offline unit tests (`test/`).
- package description and keywords updated.
