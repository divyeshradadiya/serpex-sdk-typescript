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