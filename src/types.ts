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
  /** Human-readable failure reason, e.g. "target returned HTTP 404". */
  error?: string;
  /**
   * Stable machine-readable failure code. Currently returned for stealth
   * extractions only — branch on this instead of parsing `error` prose.
   *
   * Crucially it separates a problem with YOUR url from a problem on OUR side:
   *   stealth_target_unreachable  — the domain did not resolve / refused us
   *   stealth_target_status       — the page answered with an error status
   *   stealth_target_empty        — 200 with no usable body (anti-bot page)
   *   stealth_timeout             — the page did not finish rendering in time
   *   stealth_provider_unavailable— our unblocker was unavailable: retry
   *   stealth_network             — network error reaching our unblocker
   *   stealth_unconfigured        — stealth is not enabled on this deployment
   */
  error_code?: StealthErrorCode | string;
  /** Failure category, shared by normal and stealth extraction. */
  error_type?: string;
  status_code?: number;
  crawled_at?: string;
  extraction_mode?: string;
}

/** Machine-readable stealth failure codes — see ExtractResult.error_code. */
export type StealthErrorCode =
  | "stealth_target_unreachable"
  | "stealth_target_status"
  | "stealth_target_empty"
  | "stealth_timeout"
  | "stealth_provider_unavailable"
  | "stealth_network"
  | "stealth_unconfigured";

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

export interface UsageParams {
  /** How many days of history to summarise (default: 30). */
  days?: number;
}

export interface UsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  /** Requests per product over the period: `search`, `crawl`, `stealth` (only those used). */
  engineStats: Record<string, number>;
}

export interface UsageCredits {
  /** Credits remaining on the workspace. */
  balance: number;
  /** Credits consumed to date. */
  totalUsed?: number;
}

export interface UsageResponse {
  /** Name of the API key the request was made with. */
  api_key: string;
  organization_id: string;
  period_days: number;
  statistics: UsageStatistics;
  credits: UsageCredits;
  /**
   * The 10 most recent requests, newest first. Shape is intentionally loose —
   * these are diagnostic records and may gain fields without a major version.
   */
  recent_requests?: Array<Record<string, any>>;
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
