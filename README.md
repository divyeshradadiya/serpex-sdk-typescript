# serpex

Official TypeScript SDK for Serpex.

Serpex is a real-time web search API and extract API for AI agents. Search returns ranked web
results, optionally with page content as markdown; Extract turns known URLs into clean markdown
or HTML. Every search is routed automatically: there is no engine to choose.

## Installation

```bash
npm install serpex
# or
yarn add serpex
# or
pnpm add serpex
```

## Quick Start

```typescript
import { SerpexClient } from "serpex";

const client = new SerpexClient("your-api-key-here");

const results = await client.search({ q: "typescript tutorial" });

console.log(results.results[0].title);
console.log(results.metadata.credits_used);
```

## API Reference

### SerpexClient

```typescript
new SerpexClient(apiKey: string, baseUrl?: string, options?: { timeoutMs?: number; userAgent?: string })
```

- `apiKey`: your API key from the Serpex dashboard.
- `baseUrl`: optional, defaults to `https://api.serpex.dev`.
- `options.timeoutMs`: optional timeout for every request, in milliseconds. By default each
  call gets its own: 60 s search, 100 s search with `include_content`, 100 s extract, 120 s
  stealth extract. A timeout throws `SerpApiException` with `details.error === "timeout"`.

- `options.userAgent`: optional product token appended to the User-Agent, e.g. `"my-agent/1.4.0"`.

Every request sends `User-Agent: serpex-js/<version>` (plus your `userAgent` token; browsers drop this header).

### `search(params: SearchParams): Promise<SearchResponse>`

```typescript
interface SearchParams {
  q: string;                 // required, 1-500 characters
  include_content?: boolean; // also fetch page content (markdown) for the top results
  content_results?: 5 | 10;  // how many top results get content (default 5)
  /** @deprecated ignored by the API, not sent */ engine?: string;
  /** @deprecated ignored by the API, not sent */ engines?: string | string[];
}
```

Only `q`, `include_content` and `content_results` are sent. Search operators go inside `q`:
`site:`, `-site:`, `after:YYYY-MM-DD` and `before:YYYY-MM-DD`.

```typescript
interface SearchResponse {
  id: string;
  query: string;
  results: SearchResult[];
  metadata: {
    number_of_results: number;
    response_time: number;          // ms
    timestamp: string;              // ISO 8601
    credits_used: number;           // 0, 1, 3 or 6
    from_cache?: boolean;
    status?: "success" | "no_results";
    content_requested?: number;     // include_content only: 5 or 10
    content_delivered?: number;     // include_content only
    no_results_verified?: boolean;  // no_results only
    charged?: boolean;              // no_results only
    message?: string;               // no_results only
  };
  message?: string;                 // no_results only
  engines?: string[];               // deprecated: always ["auto"]
}

// content and content_error are mutually exclusive. Both exist only with
// include_content: true, and only on the first content_results results.
type SearchResult = SearchResultBase & (
  | { content: string }              // page markdown
  | { content_error: ContentErrorCode } // e.g. "robots_disallowed", "timeout", "blocked"
  | {}                               // plain search, or beyond content_results
);
```

A search that finds nothing returns HTTP 200 with `results: []` and `metadata.status:
"no_results"`. It is charged (1 credit) only when `no_results_verified` is true.

#### Search with page content

```typescript
const results = await client.search({
  q: "best espresso machines 2025",
  include_content: true,
  content_results: 10,
});

console.log(`${results.metadata.content_delivered}/${results.metadata.content_requested} pages delivered`);

for (const result of results.results) {
  if (result.content !== undefined) {
    console.log(`${result.url}: ${result.content.length} chars of markdown`);
  } else if (result.content_error !== undefined) {
    console.log(`${result.url}: no content (${result.content_error})`);
  }
}
```

Credits with `include_content`: 1 when no page came back, 3 for 1-5 pages, 6 for 6-10 pages.

### `extract(params: ExtractParams): Promise<ExtractResponse>`

Extract 1 to 10 URLs as markdown (default) or HTML. Each URL succeeds or fails on its own;
failed URLs are never charged.

```typescript
interface ExtractParams {
  urls: string[];                 // 1-10 absolute URLs
  format?: "markdown" | "html";   // default "markdown"
  /** @deprecated stealth mode ends on 2026-11-01 (HTTP 410 from then) */
  stealth?: boolean;
}

interface ExtractResponse {
  success: boolean;               // the request was processed; check each result
  results: ExtractResult[];       // ExtractSuccess | ExtractFailure, narrow on `success`
  metadata: {
    total_urls: number;
    processed_urls: number;
    successful_crawls: number;
    failed_crawls: number;
    credits_used: number;
    cached_free?: number;         // free repeats; omitted when 0
    stealth?: boolean;            // stealth requests only
    response_time: number;
    timestamp: string;
  };
}

interface ExtractSuccess { url: string; success: true; markdown?: string; html?: string; status_code?: number }
interface ExtractFailure {
  url: string;
  success: false;
  error: string;                  // e.g. "HTTP 404: Not Found"
  error_type: ExtractErrorType;   // timeout, connection, dns_unresolved, ssl_error, http, blocked,
                                  // robots_disallowed, server_error, unsupported_content_type,
                                  // too_large, unknown
  status_code?: number;
  error_code?: StealthErrorCode;  // stealth only
}
```

```typescript
const { results, metadata } = await client.extract({
  urls: ["https://example.com", "https://example.com/missing"],
});

for (const r of results) {
  if (r.success) console.log(r.url, r.markdown?.length);
  else console.log(r.url, r.error_type, r.error);
}
console.log(`credits used: ${metadata.credits_used}`);
```

#### Stealth mode (ends 2026-11-01)

`stealth: true` renders the page in a full browser for 5 credits per URL. **It ends on
2026-11-01.** From that date the API rejects it with HTTP 410 (not charged); send the request
without `stealth`. The SDK logs one `console.warn` per process when you use it.

A failed stealth result says `"This page could not be rendered. Not charged."` and may carry an
`error_code`: `stealth_target_unreachable` (domain gone), `stealth_target_status` (error status,
see `status_code`), `stealth_target_empty`, `stealth_timeout`, `stealth_network`,
`stealth_unconfigured`. Failures on our side carry `error_type: "server_error"` without a code
(`stealth_provider_unavailable` is never returned).

### `usage(params?: UsageParams): Promise<UsageResponse>`

Credit balance and request counts for your **whole organization** (every API key in it).
`api_key` in the response is the key's **name**, never the key. Free (no credits), but it
counts against your per-second rate limit.

```typescript
const usage = await client.usage();             // last 30 days
const week = await client.usage({ days: 7 });  // 1-90

console.log(usage.credits.balance);
console.log(usage.statistics.engineStats);      // { search: 120, crawl: 30, stealth: 5 }
```

```typescript
interface UsageResponse {
  api_key: string;
  organization_id: string;
  period_days: number;          // your days, capped at 90
  effective_days?: number;      // days actually covered (history is kept 30 days)
  statistics: {
    totalRequests: number;
    successfulRequests: number; // includes no_results
    failedRequests: number;
    noResultsRequests?: number;
    engineStats: { search?: number; crawl?: number; stealth?: number };
  };
  credits: { balance: number; totalUsed?: number };
  recent_requests?: UsageRecentRequest[]; // 10 newest; no query text
}
```

## Errors

Every API error is thrown as `SerpApiException`:

| field | meaning |
|---|---|
| `statusCode` | HTTP status; `undefined` for a timeout or network failure |
| `message` | the API's error text |
| `details` | the parsed error body (`SerpApiError`) |
| `retryable` | true for 429, 5xx, timeouts and network failures |
| `retryAfterMs` | 429 only: how long to wait |
| `requestId` | 500/502: quote it to support |

| Status | When | Retry |
|---|---|---|
| 400 | missing or invalid `q`, `include_content`, `content_results`, `urls` or `days` | no |
| 401 | missing or invalid API key | no |
| 402 | insufficient credits (`details.remainingCredits`) | no |
| 403 | stealth not included in your plan | no |
| 410 | stealth after 2026-11-01 | no |
| 429 | over your per-second limit: 5, 25 or 50 requests/s by plan (`details.limit`) | yes, after `retryAfterMs` |
| 500 / 502 / 503 / 504 | our side, never charged | yes |

A search with page content counts as more than one request toward the rate limit: 2 with
`content_results: 5`, 3 with `content_results: 10`.

```typescript
import { SerpexClient, SerpApiException } from "serpex";

try {
  await client.search({ q: "test query" });
} catch (error) {
  if (error instanceof SerpApiException) {
    if (error.statusCode === 429) await new Promise((r) => setTimeout(r, error.retryAfterMs ?? 1000));
    else if (error.statusCode === 402) console.log("Out of credits:", error.details?.remainingCredits);
    else if (error.retryable) console.log("Temporary, retry:", error.message);
    else console.log(`API error ${error.statusCode}: ${error.message}`);
  }
}
```

## The `engine` parameter (deprecated)

There is nothing to select. `engine` / `engines` are ignored by the API (since 2026-06). The
SDK still accepts them so existing code compiles, does not send them, and logs one
`console.warn` the first time you pass them (or any other option the API ignores). The
`engines` / `results[].engine` response fields are deprecated too: always `"auto"`.

## License

MIT
