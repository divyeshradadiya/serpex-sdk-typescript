# serpex

Official TypeScript SDK for the Serpex SERP API - Fetch search results in JSON format.

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

// Initialize the client with your API key
const client = new SerpexClient("your-api-key-here");

// Search with auto-routing (recommended)
const results = await client.search({
  q: "typescript tutorial",
  engine: "auto",
});

// Search with specific engine
const googleResults = await client.search({
  q: "typescript tutorial",
  engine: "google",
});

console.log(results.results[0].title);
console.log(googleResults.results[0].title);
```

## API Reference

### SerpexClient

#### Constructor

```typescript
new SerpexClient(apiKey: string, baseUrl?: string)
```

- `apiKey`: Your API key from the Serpex dashboard
- `baseUrl`: Optional base URL (defaults to 'https://api.serpex.dev')

#### Methods

##### `extract(params: ExtractParams): Promise<ExtractResponse>`

Extract content from web pages and convert them to LLM-ready markdown data. Accepts up to 10 URLs per request.

```typescript
// Basic usage
const results = await client.extract({
  urls: ["https://example.com", "https://httpbin.org"],
});

// With stealth mode and HTML output
const stealthResults = await client.extract({
  urls: ["https://example.com"],
  stealth: true,
  format: "html",
});
```

## Extract Parameters

The `ExtractParams` interface supports extraction parameters:

```typescript
interface ExtractParams {
  // Required: URLs to extract (max 10)
  urls: string[];

  // Optional: Route through premium unblocker for difficult-to-crawl pages (default: false)
  stealth?: boolean;

  // Optional: Output format — 'markdown' (default) or 'html'
  format?: "markdown" | "html";
}
```

## Extract Response Format

```typescript
interface ExtractResponse {
  success: boolean;
  results: ExtractResult[];
  metadata: ExtractMetadata;
}

interface ExtractResult {
  url: string;
  success: boolean;
  markdown?: string;
  html?: string;        // Populated when format='html'
  stealth?: boolean;    // Whether stealth mode was used for this result
  error?: string;       // Human-readable reason, e.g. "target returned HTTP 404"
  error_code?: string;  // Stable code (stealth only) — see "Stealth error codes"
  error_type?: string;
  status_code?: number;
  crawled_at?: string;
  extraction_mode?: string;
}

interface ExtractMetadata {
  total_urls: number;
  processed_urls: number;
  successful_crawls: number;
  failed_crawls: number;
  credits_used: number;
  cached_free?: number; // Number of URLs served from cache (no credit charge)
  response_time: number;
  timestamp: string;
}
```

### Stealth error codes

When `stealth: true`, a failed result carries a stable `error_code` alongside the
human-readable `error`. Branch on the code rather than parsing the message — it
tells you whether the problem is with **your URL** or with **our service**:

| `error_code` | `error_type` | Meaning | Retry? |
|---|---|---|---|
| `stealth_target_unreachable` | `connection` | The domain did not resolve or refused the connection — the site is likely gone | No |
| `stealth_target_status` | `http` | The page answered with an error status (see `status_code`) | No |
| `stealth_target_empty` | `blocked` | The page answered `200` with no usable body — typically an anti-bot interstitial | Maybe |
| `stealth_timeout` | `timeout` | The page did not finish rendering in time | Yes |
| `stealth_provider_unavailable` | `server_error` | **Our** unblocking provider was unavailable — not a problem with your URL | Yes |
| `stealth_network` | `connection` | Network error reaching our unblocker | Yes |
| `stealth_unconfigured` | `server_error` | Stealth is not enabled on this deployment | No |

```typescript
const { results } = await client.extract({ urls, stealth: true });

for (const r of results) {
  if (r.success) continue;
  if (r.error_code === "stealth_target_unreachable") {
    // The domain is dead — drop it from your list.
  } else if (r.error_code === "stealth_provider_unavailable") {
    // Our side. Safe to retry shortly.
  }
}
```

##### `usage(params?: UsageParams): Promise<UsageResponse>`

Check your credit balance and request history — useful before a large batch.

```typescript
const usage = await client.usage();          // last 30 days
const week  = await client.usage({ days: 7 });

console.log(usage.credits.balance);          // credits remaining
console.log(usage.statistics.totalRequests); // requests in the period
console.log(usage.statistics.engineStats);   // { duckduckgo: 120, yahoo: 30 }
```

```typescript
interface UsageResponse {
  api_key: string;
  organization_id: string;
  period_days: number;
  statistics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    engineStats: Record<string, number>;
  };
  credits: { balance: number; totalUsed?: number };
  recent_requests?: Array<Record<string, any>>;
}
```

## Search Parameters

The `SearchParams` interface supports all search parameters:

```typescript
interface SearchParams {
  // Required: search query
  q: string;

  // Optional: Engine selection (defaults to 'auto')
  engine?:
    | "auto"
    | "google"
    | "bing"
    | "duckduckgo"
    | "brave"
    | "yahoo"
    | "yandex";

  // Optional: also fetch page content (markdown) for top results (default: false)
  include_content?: boolean;

  // Optional: number of top results to fetch content for — must be exactly
  // 5 or 10 (default: 5). Only relevant when include_content is true.
  content_results?: 5 | 10;
}
```

| Param | Type | Default | Notes |
|---|---|---|---|
| `q` | `string` | — | Required search query (max 500 chars) |
| `include_content` | `boolean` | `false` | Also fetch page content (markdown) for top results |
| `content_results` | `5 \| 10` | `5` | How many top results to fetch content for; must be exactly `5` or `10` |


## Supported Engines

- **auto**: Automatically routes to the best available search engine
- **google**: Google's primary search engine
- **bing**: Microsoft's search engine
- **duckduckgo**: Privacy-focused search engine
- **brave**: Privacy-first search engine
- **yahoo**: Yahoo search engine
- **yandex**: Russian search engine

## Response Format

```typescript
interface SearchResponse {
  metadata: {
    number_of_results: number;
    response_time: number;
    timestamp: string;
    credits_used: number;
    from_cache?: boolean;
    status?: string;
    // Present only when include_content was requested
    content_requested?: number;
    content_delivered?: number;
  };
  id: string;
  query: string;
  engines: string[];
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    position: number;
    engine: string;
    img_src?: string;
    duration?: string;
    score?: number;
    // Present only when include_content was requested. Best-effort — a
    // failed extraction sets content_error instead of content.
    content?: string;
    content_error?: string;
  }>;
}
```

## Error Handling

The SDK throws `SerpApiException` for API errors:

```typescript
import { SerpexClient, SerpApiException } from "serpex";

try {
  const results = await client.search({ q: "test query" });
} catch (error) {
  if (error instanceof SerpApiException) {
    console.log("API Error:", error.message);
    console.log("Status Code:", error.statusCode);
    console.log("Details:", error.details);
  }
}
```

## Examples

### Basic Search

```typescript
const results = await client.search({
  q: "coffee shops near me",
});
```

### Search with Page Content

Fetch page content (markdown) for the top results inline with the search —
best-effort, so check each result for `content` vs `content_error`.

```typescript
const results = await client.search({
  q: "best espresso machines 2025",
  include_content: true,
  content_results: 10, // must be exactly 5 or 10
});

console.log(
  `Content delivered for ${results.metadata.content_delivered}/${results.metadata.content_requested} requested results`
);

for (const result of results.results) {
  if (result.content) {
    console.log(`✅ ${result.url}: ${result.content.length} chars of markdown`);
  } else if (result.content_error) {
    console.log(`❌ ${result.url}: ${result.content_error}`);
  }
}
```


### Extract Web Content to LLM-Ready Data

#### Extract from a Single URL

```typescript
// Extract content from one website (markdown, default)
const result = await client.extract({
  urls: ["https://example.com"],
});

if (result.results[0].success) {
  console.log(`✅ Extracted ${result.results[0].markdown?.length} characters`);
  console.log(
    "Markdown content:",
    result.results[0].markdown?.substring(0, 200) + "..."
  );
}

// Extract with stealth mode and HTML output
const stealthResult = await client.extract({
  urls: ["https://example.com"],
  stealth: true,
  format: "html",
});

if (stealthResult.results[0].success) {
  console.log("HTML content:", stealthResult.results[0].html?.substring(0, 200));
}
```

#### Extract from Multiple URLs (up to 10 at once)

```typescript
// Extract content from multiple websites (up to 10 URLs)
const extractResults = await client.extract({
  urls: ["https://example.com", "https://httpbin.org", "https://github.com"],
});

console.log(
  `Successfully extracted ${extractResults.metadata.successful_crawls} pages`
);
console.log(`Total credits used: ${extractResults.metadata.credits_used}`);

extractResults.results.forEach((result) => {
  if (result.success) {
    console.log(`✅ ${result.url}: ${result.markdown?.length} characters`);
    // Use result.markdown for LLM processing
  } else {
    console.log(`❌ ${result.url}: ${result.error}`);
  }
});
```

#### Sample Response

```typescript
// Example response structure
{
  success: true,
  results: [
    {
      url: 'https://example.com',
      success: true,
      markdown: '# Example Domain\n\nThis domain is for use in...',
      stealth: false,
      status_code: 200
    }
  ],
  metadata: {
    total_urls: 1,
    processed_urls: 1,
    successful_crawls: 1,
    failed_crawls: 0,
    credits_used: 3,
    cached_free: 0,
    response_time: 255,
    timestamp: '2025-11-13T10:30:00.000Z'
  }
}
```

## License

MIT
