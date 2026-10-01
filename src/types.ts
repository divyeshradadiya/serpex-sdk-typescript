// TypeScript SDK for Serpex — the web search API and extract API for AI agents
// Types and interfaces

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  /**
   * @deprecated Always "auto" today and may be removed from responses in a
   * later API version. Optional so code does not rely on it.
   */
  engine?: string;
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
  // Present only when `status` is "no_results".
  /** True when the empty result was confirmed (not an upstream failure). */
  no_results_verified?: boolean;
  /** Whether this no-results search was billed. */
  charged?: boolean;
  message?: string;
}

export interface SearchResponse {
  metadata: SearchMetadata;
  id: string;
  query: string;
  /**
   * @deprecated Always ["auto"] today and may be removed from responses in a
   * later API version.
   */
  engines?: string[];
  results: SearchResult[];
  /** Present only when no results were found. */
  message?: string;
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
   *   stealth_target_empty        — 200 with no usable content
   *   stealth_timeout             — the page did not finish rendering in time
   *   stealth_provider_unavailable— our stealth extraction service was unavailable: retry
   *   stealth_network             — network error inside our stealth extraction service
   *   stealth_unconfigured        — stealth is not enabled on this deployment
   */
  error_code?: StealthErrorCode | string;
  /** Failure category, shared by normal and stealth extraction. */
  error_type?: string;
  status_code?: number;
  /** @deprecated Never returned by the API; always undefined. Removed in 3.0. */
  crawled_at?: string;
  /** @deprecated Never returned by the API; always undefined. Removed in 3.0. */
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
  /** URLs served free as a same-workspace repeat (present only when > 0). */
  cached_free?: number;
  response_time: number;
  timestamp: string;
  /** True when the request used stealth extraction. */
  stealth?: boolean;
}

export interface ExtractResponse {
  success: boolean;
  results: ExtractResult[];
  metadata: ExtractMetadata;
}

export interface ExtractParams {
  // Required: URLs to extract (max 10)
  urls: string[];

  // Optional: premium extraction mode for pages that standard extraction can't read (default: false)
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

  /**
   * @deprecated Ignored by the API since 2026-06. Still accepted so existing
   * code compiles; the SDK does not send it and warns once.
   */
  engine?: string;

  /**
   * @deprecated Ignored by the API since 2026-06. Still accepted so existing
   * code compiles; the SDK does not send it and warns once.
   */
  engines?: string | string[];
}

export interface SerpexClientOptions {
  /**
   * Timeout in milliseconds for every request. When omitted, each call uses a
   * default sized above the server's own budget: 60 s search, 100 s search
   * with include_content, 100 s extract, 120 s stealth extract.
   */
  timeoutMs?: number;
}

export interface UsageParams {
  /** How many days of history to summarise, 1-90 (default: 30; larger values are capped at 90). */
  days?: number;
}

export interface UsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  /** Zero-result searches (also counted in successfulRequests). */
  noResultsRequests?: number;
  /** Requests per product over the period: `search`, `crawl`, `stealth` (only those used). */
  engineStats: Record<string, number>;
}

export interface UsageCredits {
  /** Credits remaining for the whole organization. */
  balance: number;
  /** Credits consumed to date. */
  totalUsed?: number;
}

/** Usage statistics and credit balance for the organization that owns the API key. */
export interface UsageResponse {
  /**
   * NAME of the API key the request was made with (not the key itself).
   * Statistics and credits cover the whole organization, not only this key.
   */
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
  /** @deprecated Legacy field; the API no longer validates `engine`. */
  invalid_engines?: string[];
  /** @deprecated Legacy field; the API no longer validates `engine`. */
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
