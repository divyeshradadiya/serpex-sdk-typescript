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
import { SerpexClient } from 'serpex';

// Initialize the client with your API key
const client = new SerpexClient('your-api-key-here');

// Search with auto-routing (recommended)
const results = await client.search({
  q: 'typescript tutorial',
  engine: 'auto'
});

// Search with specific engine
const googleResults = await client.search({
  q: 'typescript tutorial',
  engine: 'google'
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
const results = await client.extract({
  urls: [
    'https://example.com',
    'https://httpbin.org'
  ]
});
```

## Extract Parameters

The `ExtractParams` interface supports extraction parameters:

```typescript
interface ExtractParams {
  // Required: URLs to extract (max 10)
  urls: string[];
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
  error?: string;
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
  response_time: number;
  timestamp: string;
}
```

## Search Parameters

The `SearchParams` interface supports all search parameters:

```typescript
interface SearchParams {
  // Required: search query
  q: string;

  // Optional: Engine selection (defaults to 'auto')
  engine?: 'auto' | 'google' | 'bing' | 'duckduckgo' | 'brave' | 'yahoo' | 'yandex';

  // Optional: Search category (currently only 'web' supported)
  category?: 'web';

  // Optional: Time range filter
  time_range?: 'all' | 'day' | 'week' | 'month' | 'year';

  // Optional: Response format
  format?: 'json' | 'csv' | 'rss';
}
```

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
    published_date: string | null;
    img_src?: string;
    duration?: string;
    score?: number;
  }>;
  answers: any[];
  corrections: string[];
  infoboxes: any[];
  suggestions: string[];
}
```

## Error Handling

The SDK throws `SerpApiException` for API errors:

```typescript
import { SerpexClient, SerpApiException } from 'serpex';

try {
  const results = await client.search({ q: 'test query' });
} catch (error) {
  if (error instanceof SerpApiException) {
    console.log('API Error:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Details:', error.details);
  }
}
```

## Examples

### Basic Search
```typescript
const results = await client.search({
  q: 'coffee shops near me'
});
```

### Advanced Search with Filters
```typescript
const results = await client.search({
  q: 'latest AI news',
  engine: 'google',
  time_range: 'day',
  category: 'web'
});
```

### Extract Web Content to LLM-Ready Data

#### Extract from a Single URL
```typescript
// Extract content from one website
const result = await client.extract({
  urls: ['https://example.com']
});

if (result.results[0].success) {
  console.log(`✅ Extracted ${result.results[0].markdown?.length} characters`);
  console.log('Markdown content:', result.results[0].markdown?.substring(0, 200) + '...');
}
```

#### Extract from Multiple URLs (up to 10 at once)
```typescript
// Extract content from multiple websites (up to 10 URLs)
const extractResults = await client.extract({
  urls: [
    'https://example.com',
    'https://httpbin.org',
    'https://github.com'
  ]
});

console.log(`Successfully extracted ${extractResults.metadata.successful_crawls} pages`);
console.log(`Total credits used: ${extractResults.metadata.credits_used}`);

extractResults.results.forEach(result => {
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
      status_code: 200
    }
  ],
  metadata: {
    total_urls: 1,
    processed_urls: 1,
    successful_crawls: 1,
    failed_crawls: 0,
    credits_used: 3,
    response_time: 255,
    timestamp: '2025-11-13T10:30:00.000Z'
  }
}
```

## License

MIT