export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    position: number;
    /** Legacy field kept for compatibility — Serpex is a single engine. */
    engine: string;
    img_src?: string;
    duration?: string;
    score?: number;
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
    content_requested?: number;
    content_delivered?: number;
}
export interface SearchResponse {
    metadata: SearchMetadata;
    id: string;
    query: string;
    /** Legacy field kept for compatibility — Serpex is a single engine. */
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
    crawled_at?: string;
    extraction_mode?: string;
}
/** Machine-readable stealth failure codes — see ExtractResult.error_code. */
export type StealthErrorCode = "stealth_target_unreachable" | "stealth_target_status" | "stealth_target_empty" | "stealth_timeout" | "stealth_provider_unavailable" | "stealth_network" | "stealth_unconfigured";
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
    urls: string[];
    stealth?: boolean;
    format?: "markdown" | "html";
}
export interface SearchParams {
    q: string;
    include_content?: boolean;
    content_results?: 5 | 10;
    /**
     * @deprecated Ignored by the API since 2026-06 — Serpex is a single search
     * engine. Still accepted so existing code compiles; the SDK does not send it.
     */
    engine?: string;
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
    /** @deprecated Legacy field; the API no longer validates `engine`. */
    invalid_engines?: string[];
    /** @deprecated Legacy field; the API no longer validates `engine`. */
    supported_engines?: string[];
    retryAfter?: number;
}
export declare class SerpApiException extends Error {
    readonly statusCode?: number;
    readonly details?: any;
    constructor(message: string, statusCode?: number, details?: any);
}
//# sourceMappingURL=types.d.ts.map