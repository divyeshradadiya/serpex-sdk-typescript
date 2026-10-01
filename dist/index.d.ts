import { SearchResponse, SearchParams, ExtractResponse, ExtractParams, UsageParams, UsageResponse, StealthErrorCode, SerpApiException, SerpexClientOptions } from "./types";
/** SDK version, sent in the User-Agent header. Keep in step with package.json. */
export declare const VERSION = "2.11.0";
export declare const SEARCH_TIMEOUT_MS = 60000;
export declare const SEARCH_CONTENT_TIMEOUT_MS = 100000;
export declare const EXTRACT_TIMEOUT_MS = 100000;
export declare const STEALTH_EXTRACT_TIMEOUT_MS = 120000;
export { SearchResponse, SearchParams, ExtractResponse, ExtractParams, UsageParams, UsageResponse, StealthErrorCode, SerpApiException, SerpexClientOptions, };
export declare class SerpexClient {
    private baseUrl;
    private apiKey;
    private timeoutMs?;
    /**
     * Create a new SerpexClient instance
     * @param apiKey - Your API key from the Serpex dashboard
     * @param baseUrl - Base URL for the API (optional, defaults to production)
     * @param options - Optional. `timeoutMs` overrides the per-call timeout for
     *   every request. When omitted, each call uses a default sized above the
     *   server's own budget: 60 s search, 100 s search with include_content,
     *   100 s extract, 120 s stealth extract.
     */
    constructor(apiKey: string, baseUrl?: string, options?: SerpexClientOptions);
    /**
     * Make an authenticated request to the API
     * @param timeoutMs - Per-call default; the constructor's `timeoutMs` overrides it
     */
    private makeRequest;
    /**
     * Run a real-time web search.
     *
     * Sends only `q`, plus `include_content` / `content_results` when set.
     * `params.engine` / `params.engines` (and any other option the API ignores)
     * are deprecated: still accepted so existing code compiles, never sent, and
     * a one-time `console.warn` names them.
     * @param params - Search parameters including query
     * @returns Search results
     */
    search(params: SearchParams): Promise<SearchResponse>;
    /**
     * Extract page content (markdown or HTML) from up to 10 URLs
     * @param params - Extraction parameters including the URLs to extract
     * @returns Extraction results
     */
    extract(params: ExtractParams): Promise<ExtractResponse>;
    /**
     * Fetch usage statistics and the credit balance for your whole organization
     * (every API key in it, not only the key making the call).
     *
     * Useful for checking your remaining balance before a large batch, or for
     * surfacing consumption in your own dashboard. `api_key` in the response is
     * the NAME of the key the call was made with, never the key itself.
     *
     * @param params - Optional: `days` of history to summarise, 1-90 (default 30; larger values are capped at 90)
     * @returns Organization-wide request counts per product (`engineStats`), plus the organization's credit balance
     */
    usage(params?: UsageParams): Promise<UsageResponse>;
}
//# sourceMappingURL=index.d.ts.map