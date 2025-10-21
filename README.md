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

##### `search(params: SearchParams): Promise<SearchResponse>`

Search using the SERP API with flexible parameters.

```typescript
const results = await client.search({
  q: 'javascript frameworks',
  engine: 'auto',
  category: 'web',
  time_range: 'week'
});
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

### Using Different Engines
```typescript
// Auto-routing (recommended)
const autoResults = await client.search({
  q: 'typescript',
  engine: 'auto'
});

// Specific engine
const googleResults = await client.search({
  q: 'typescript',
  engine: 'google'
});

// Privacy-focused search
const ddgResults = await client.search({
  q: 'typescript',
  engine: 'duckduckgo'
});
```

## License

MIT