/**
 * Outcome of a search that returned HTTP 200. A search that could not be
 * completed returns HTTP 503 instead and is thrown as a SerpApiException.
 */
export type SearchStatus = "success" | "no_results";
/**
 * Why page content is missing for one result (`include_content: true`).
 * Known values are listed; other strings may appear in the future.
 */
export type ContentErrorCode = ExtractErrorType | "content_deadline_exceeded" | "content_capacity" | "content_unavailable" | "unsupported_url" | (string & {});
/** Fields every search result carries. */
export interface SearchResultBase {
    title: string;
    url: string;
    snippet: string;
    /** 1-based rank. */
    position: number;
    /**
     * @deprecated Always "auto": every search is routed automatically. Kept so
     * existing code keeps working; may be removed in a later API version.
     */
    engine?: string;
    /** Image URL, present only when one is available. */
    img_src?: string;
    /** Media duration, present only when one is available. */
    duration?: string;
    /** Relevance score, present only when one is available. */
    score?: number;
}
/**
 * One search result.
 *
 * `content` and `content_error` are mutually exclusive and exist only on
 * requests with `include_content: true`, and only on the first
 * `content_results` results: a successful page fetch sets `content`
 * (markdown), a failed one sets `content_error`. Every other result has
 * neither key.
 */
export type SearchResult = SearchResultBase & ({
    content: string;
    content_error?: never;
} | {
    content_error: ContentErrorCode;
    content?: never;
} | {
    content?: never;
    content_error?: never;
});
export interface SearchMetadata {
    /** Number of results in `results`. */
    number_of_results: number;
    /** Server-side time in milliseconds. */
    response_time: number;
    /** ISO 8601 timestamp. */
    timestamp: string;
    /**
     * Credits charged for this request: 0, 1, 3 or 6. 0 for your organization's
     * own repeat of the same query and content options within 5 minutes, and for
     * an empty result that could not be confirmed as genuinely empty.
     */
    credits_used: number;
    /** True when served from the content cache (informational, not a billing flag). */
    from_cache?: boolean;
    status?: SearchStatus;
    /** Present only with `include_content: true`: the requested tier (5 or 10). */
    content_requested?: number;
    /** Present only with `include_content: true`: results that came back with content. */
    content_delivered?: number;
    /** Present only when `status` is "no_results": true when the empty result was confirmed. */
    no_results_verified?: boolean;
    /** Present only when `status` is "no_results": whether this request was charged. */
    charged?: boolean;
    /** Present only when `status` is "no_results": human-readable explanation. */
    message?: string;
}
export interface SearchResponse {
    metadata: SearchMetadata;
    /** Unique id of this response (UUID). */
    id: string;
    /** The query you sent. */
    query: string;
    /**
     * @deprecated Always ["auto"]: every search is routed automatically. May be
     * removed from responses in a later API version.
     */
    engines?: string[];
    results: SearchResult[];
    /** Present only when no results were found (same text as `metadata.message`). */
    message?: string;
}
/** Canonical per-URL extraction failure category. */
export type ExtractErrorType = "timeout" | "connection" | "dns_unresolved" | "ssl_error" | "http" | "blocked" | "robots_disallowed" | "server_error" | "unsupported_content_type" | "too_large" | "unknown" | (string & {});
/**
 * Machine-readable stealth failure codes — see ExtractFailure.error_code.
 * The API does not return codes that name its rendering service, so
 * "stealth_provider_unavailable" never reaches you; it stays listed for
 * existing code. Such a failure carries `error_type: "server_error"`.
 */
export type StealthErrorCode = "stealth_target_unreachable" | "stealth_target_status" | "stealth_target_empty" | "stealth_timeout" | "stealth_provider_unavailable" | "stealth_network" | "stealth_unconfigured";
interface ExtractResultBase {
    url: string;
    /** HTTP status of the target page, when known. */
    status_code?: number;
    /** Present (always true) only on `stealth: true` requests. */
    stealth?: boolean;
    /** @deprecated Never returned by the API; always undefined. Removed in 3.0. */
    crawled_at?: string;
    /** @deprecated Never returned by the API; always undefined. Removed in 3.0. */
    extraction_mode?: string;
}
/** A URL that was extracted. Charged (1 credit, or 5 in stealth mode) unless a free repeat. */
export interface ExtractSuccess extends ExtractResultBase {
    success: true;
    /** Present when `format` is "markdown" (default). */
    markdown?: string;
    /** Present when `format` is "html". */
    html?: string;
    error?: never;
    error_type?: never;
    error_code?: never;
}
/** A URL that could not be extracted. Never charged. */
export interface ExtractFailure extends ExtractResultBase {
    success: false;
    /** Always "" on a failure. */
    markdown?: string;
    html?: never;
    /** Human-readable failure reason, e.g. "HTTP 404: Not Found". */
    error: string;
    /** Failure category, shared by normal and stealth extraction. Branch on this. */
    error_type: ExtractErrorType;
    /** Stable code, stealth extractions only. */
    error_code?: StealthErrorCode | (string & {});
}
/** One extracted URL: narrow on `success`. */
export type ExtractResult = ExtractSuccess | ExtractFailure;
export interface ExtractMetadata {
    total_urls: number;
    processed_urls: number;
    successful_crawls: number;
    failed_crawls: number;
    credits_used: number;
    /** URLs served free as your organization's repeat within 5 minutes (present only when > 0). */
    cached_free?: number;
    response_time: number;
    timestamp: string;
    /** Present (always true) only on `stealth: true` requests. */
    stealth?: boolean;
}
export interface ExtractResponse {
    /** True when the request was processed; check `results[].success` per URL. */
    success: boolean;
    results: ExtractResult[];
    metadata: ExtractMetadata;
}
export interface ExtractParams {
    /** URLs to extract: 1 to 10 absolute URLs. */
    urls: string[];
    /**
     * @deprecated Stealth mode ends on 2026-11-01. From that date the API rejects
     * `stealth: true` with HTTP 410 (thrown as SerpApiException, not charged).
     * Until then it renders the page in a full browser for 5 credits per URL.
     */
    stealth?: boolean;
    /** Output format: "markdown" (default) or "html". */
    format?: "markdown" | "html";
}
export interface SearchParams {
    /** Search query, 1 to 500 characters. Operators such as site:, -site:, after: and before: go here. */
    q: string;
    /** Also fetch page content (markdown) for the top results (default: false). */
    include_content?: boolean;
    /**
     * How many top results get page content: exactly 5 or 10 (default: 5).
     * Only used with `include_content: true`.
     */
    content_results?: 5 | 10;
    /**
     * @deprecated Ignored by the API since 2026-06: every search is routed
     * automatically. Still accepted so existing code compiles; the SDK does not
     * send it and warns once.
     */
    engine?: string;
    /** @deprecated Same as `engine`: ignored, not sent, warns once. */
    engines?: string | string[];
}
export interface SerpexClientOptions {
    /**
     * Timeout in milliseconds for every request. When omitted, each call uses a
     * default sized above the server's own budget: 60 s search, 100 s search
     * with include_content, 100 s extract, 120 s stealth extract.
     */
    timeoutMs?: number;
    /**
     * Product token appended to the SDK's User-Agent, e.g. "my-agent/1.4.0", so
     * your integration shows up in Serpex's request logs. Sent as
     * "serpex-js/<sdk version> <userAgent>".
     */
    userAgent?: string;
}
export interface UsageParams {
    /** How many days of history to summarise, 1-90 (default: 30; larger values are capped at 90). */
    days?: number;
}
export interface UsageStatistics {
    totalRequests: number;
    /** Served requests, including searches that returned no results. */
    successfulRequests: number;
    failedRequests: number;
    /** Zero-result searches (also counted in successfulRequests). */
    noResultsRequests?: number;
    /** Requests per product over the period: `search`, `crawl`, `stealth` (only keys with a count above 0). */
    engineStats: Partial<Record<"search" | "crawl" | "stealth", number>> & Record<string, number>;
}
export interface UsageCredits {
    /** Credits remaining for the whole organization (synced about once a minute). */
    balance: number;
    /** Credits consumed to date. */
    totalUsed?: number;
}
/** One of the 10 most recent requests in `UsageResponse.recent_requests`. */
export interface UsageRecentRequest {
    id: number;
    organizationId: string | null;
    /** Product that served the request. */
    searchEngine: "search" | "crawl" | "stealth" | (string & {});
    /** "auto" for searches, "crawl" or "stealth" for extract requests; null on older records. */
    requestedEngine: string | null;
    /** Results returned (search) or URLs submitted (extract). */
    resultsCount: number | null;
    status: "success" | "no_results" | "error" | (string & {});
    /** Milliseconds. */
    responseTime: number | null;
    fromCache: boolean;
    contentRequested: boolean;
    /** 5 or 10; null when page content was not requested. */
    contentPagesRequested: number | null;
    /** null when page content was not requested. */
    contentPagesDelivered: number | null;
    /** ISO 8601. */
    createdAt: string | null;
}
/** Usage statistics and credit balance for the organization that owns the API key. */
export interface UsageResponse {
    /**
     * NAME of the API key the request was made with (not the key itself).
     * Statistics and credits cover the whole organization, not only this key.
     */
    api_key: string;
    organization_id: string;
    /** The `days` you asked for, capped at 90. */
    period_days: number;
    /**
     * Days the counts actually cover: request history is kept for 30 days, so
     * this is the smaller of `period_days` and the retention window.
     */
    effective_days?: number;
    statistics: UsageStatistics;
    credits: UsageCredits;
    /** The 10 most recent requests in the period, newest first. */
    recent_requests?: UsageRecentRequest[];
}
/**
 * Error body returned by the API. Every field except `error` depends on the
 * status code:
 * - 400: `example` (missing q) or `invalid_urls` (extract)
 * - 402: `remainingCredits`
 * - 429: `limit` (requests per second) and `retryAfterMs`
 * - 500/502: `request_id` — quote it to support
 * - 410/502/503/504: `retryable`
 * - 503 (search): `status: "error"` and `metadata`
 */
export interface SerpApiError {
    /** A string on every Serpex error; an object `{ message, status }` from the framework error handler (e.g. malformed JSON). */
    error: string | {
        message: string;
        status: number;
    };
    /** Present on framework 404 bodies. */
    message?: string;
    statusCode?: number;
    status?: "error";
    retryable?: boolean;
    request_id?: string;
    remainingCredits?: number;
    limit?: number;
    retryAfterMs?: number;
    invalid_urls?: string[];
    example?: string;
    metadata?: {
        status: "error";
        response_time: number;
        timestamp: string;
    };
    /** @deprecated Never returned by the API. */
    details?: string;
    /** @deprecated Legacy field; the API no longer validates `engine`. */
    invalid_engines?: string[];
    /** @deprecated Legacy field; the API no longer validates `engine`. */
    supported_engines?: string[];
    /** @deprecated Never returned by the API; use `retryAfterMs`. */
    retryAfter?: number;
}
/** Human-readable message for an error body, never "[object Object]". */
export declare function errorMessageFrom(body: unknown, status?: number): string;
export declare class SerpApiException extends Error {
    /** HTTP status; undefined for a timeout or a network failure. */
    readonly statusCode?: number;
    /** Parsed error body (see SerpApiError), or `{ error: "timeout" | "network", ... }`. */
    readonly details?: any;
    /** True when the same request can succeed on retry (429, 5xx, timeout, network). */
    readonly retryable: boolean;
    /** How long to wait before retrying, from the body (`retryAfterMs`) or the `Retry-After` header. */
    readonly retryAfterMs?: number;
    /** Quote this to support (500 and 502 bodies). */
    readonly requestId?: string;
    constructor(message: string, statusCode?: number, details?: any, extra?: {
        retryable?: boolean;
        retryAfterMs?: number;
        cause?: unknown;
    });
}
export {};
//# sourceMappingURL=types.d.ts.map