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
    category?: string;
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
    urls: string[];
    stealth?: boolean;
    format?: "markdown" | "html";
}
export interface SearchParams {
    q: string;
    engine?: "auto" | "google" | "bing" | "duckduckgo" | "brave" | "yahoo" | "yandex";
    category?: "web";
    time_range?: "all" | "day" | "week" | "month" | "year";
    format?: "json" | "csv" | "rss";
}
export interface SerpApiError {
    error: string;
    details?: string;
    invalid_engines?: string[];
    supported_engines?: string[];
    retryAfter?: number;
}
export declare class SerpApiException extends Error {
    readonly statusCode?: number;
    readonly details?: any;
    constructor(message: string, statusCode?: number, details?: any);
}
//# sourceMappingURL=types.d.ts.map