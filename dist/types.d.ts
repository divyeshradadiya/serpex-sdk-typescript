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
    q: string;
    engine?: 'auto' | 'google' | 'bing' | 'duckduckgo' | 'brave' | 'yahoo' | 'yandex';
    category?: 'web';
    time_range?: 'all' | 'day' | 'week' | 'month' | 'year';
    format?: 'json' | 'csv' | 'rss';
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