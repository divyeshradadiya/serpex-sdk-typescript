// TypeScript SDK for Serpex SERP API
// Types and interfaces

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  engine: string;
  published_date: string | null;
  img_src?: string;
  duration?: string;
  score?: number;
}

export interface SearchMetadata {
  number_of_results: number;
  response_time: number;
  timestamp: string;
  credits_used: number;
}

export interface SearchResponse {
  metadata: SearchMetadata;
  id: string;
  query: string;
  engines: string[];
  results: SearchResult[];
  answers: any[];
  corrections: string[];
  infoboxes: any[];
  suggestions: string[];
}

export interface SearchParams {
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

export interface SerpApiError {
  error: string;
  details?: string;
  invalid_engines?: string[];
  supported_engines?: string[];
  retryAfter?: number;
}

export class SerpApiException extends Error {
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'SerpApiException';
    this.statusCode = statusCode;
    this.details = details;
  }
}