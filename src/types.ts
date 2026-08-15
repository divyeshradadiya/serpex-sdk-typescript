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
  // Present only when `include_content` was requested. Best-effort per-URL
  // extraction: a successful fetch sets `content`, a failed one sets
  // `content_error` instead — the two are mutually exclusive and both are
  // omitted entirely when content wasn't requested for this result.
  content?: string;
  content_error?: string;
}

export interface SearchMetadata {
  number_of_results: number;
  response_time: number;
  timestamp: string;
  credits_used: number;
  from_cache?: boolean;
  status?: string;
  // Present only when `include_content` was requested.
  content_requested?: number;
  content_delivered?: number;
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

  // Optional: also fetch page content (markdown) for top results (default: false)
  include_content?: boolean;

  // Optional: number of top results to fetch content for — must be exactly
  // 5 or 10 (default: 5). Only relevant when include_content is true.
  content_results?: 5 | 10;
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
