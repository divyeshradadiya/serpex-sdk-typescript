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

// Search with Google
const googleResults = await client.search({
  q: 'typescript tutorial',
  engine: 'google',
  hl: 'en'
});

// Search with Bing
const bingResults = await client.search({
  q: 'typescript tutorial',
  engine: 'bing',
  mkt: 'en-US'
});

console.log(googleResults.results[0].title);
console.log(bingResults.results[0].title);
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

Search using the SERP API with flexible parameters. Engine parameter is required.

```typescript
const results = await client.search({
  q: 'javascript frameworks',
  engine: 'duckduckgo',
  region: 'us-en',
  safesearch: 1
});
```

Search using the SERP API with flexible parameters.

```typescript
const results = await client.search({
  q: 'javascript frameworks',
  engines: ['google', 'duckduckgo'],
  language: 'en',
  country: 'us',
  safesearch: 1,
  time_range: 'year',
  pageno: 1,
  // Google-specific parameters
  hl: 'en',
  lr: 'lang_en',
  // Bing-specific parameters
  mkt: 'en-US'
});
```

## Search Parameters

The `SearchParams` interface supports all search parameters:

```typescript
interface SearchParams {
  // Required: query (use either q or query)
  q?: string;
  query?: string;

  // Engine selection (only one engine allowed)
  engine?: string;

  // Common parameters
  language?: string;
  pageno?: number;
  page?: number;
  time_range?: string;
  safesearch?: number;

  // Google specific
  hl?: string;  // language
  lr?: string;  // language restrict
  cr?: string;  // country restrict

  // Bing specific
  mkt?: string; // market

  // DuckDuckGo specific
  region?: string;

  // Brave specific
  category?: string;
  spellcheck?: boolean;
  ui_lang?: string;
  country?: string;

  // Legacy support
  maxResults?: number;
}
```

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


## License

MIT