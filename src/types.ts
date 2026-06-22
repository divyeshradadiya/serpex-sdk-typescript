// TypeScript SDK for Serpex SERP API
// Types and interfaces

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  engine: string;
  img_src?: string;
  duration?: string;
  score?: number;
}

export interface SearchMetadata {
  number_of_results: number;
  response_time: number;
  timestamp: string;
  credits_used: number;
  from_cache?: boolean;
  status?: string;
}

export interface SearchResponse {
  metadata: SearchMetadata;
  id: string;
  query: string;
  engines: string[];
  results: SearchResult[];
}

export interface ExtractResult {
  url: string;
  success: boolean;
  markdown?: string;
  html?: string;
  stealth?: boolean;
  error?: string;
  error_type?: string;
  status_code?: number;
  crawled_at?: string;
  extraction_mode?: string;
}

export interface ExtractMetadata {
  total_urls: number;
  processed_urls: number;
  successful_crawls: number;
  failed_crawls: number;
  credits_used: number;
  cached_free?: number;
  response_time: number;
  timestamp: string;
}

export interface ExtractResponse {
  success: boolean;
  results: ExtractResult[];
  metadata: ExtractMetadata;
}

export interface ExtractParams {
  // Required: URLs to extract (max 10)
  urls: string[];

  // Optional: Route through premium unblocker for difficult-to-crawl pages (default: false)
  stealth?: boolean;

  // Optional: Output format — 'markdown' (default) or 'html'
  format?: "markdown" | "html";
}

export interface SearchParams {
  // Required: search query
  q: string;
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
    this.name = "SerpApiException";
    this.statusCode = statusCode;
    this.details = details;
  }
}
