import { SearchResponse, SearchParams, ExtractResponse, ExtractParams, UsageParams, UsageResponse, StealthErrorCode, SerpApiException } from "./types";
export { SearchResponse, SearchParams, ExtractResponse, ExtractParams, UsageParams, UsageResponse, StealthErrorCode, SerpApiException, };
export declare class SerpexClient {
    private baseUrl;
    private apiKey;
    /**
     * Create a new SerpexClient instance
     * @param apiKey - Your API key from the Serpex dashboard
     * @param baseUrl - Base URL for the API (optional, defaults to production)
     */
    constructor(apiKey: string, baseUrl?: string);
    /**
     * Make an authenticated request to the API
     */
    private makeRequest;
    /**
     * Search using the SERP API
     * @param params - Search parameters including query
     * @returns Search results
     */
    search(params: SearchParams): Promise<SearchResponse>;
    /**
     * Extract content from web pages
     * @param params - Extraction parameters including URLs to scrape
     * @returns Extraction results
     */
    extract(params: ExtractParams): Promise<ExtractResponse>;
    /**
     * Fetch usage statistics and the current credit balance for this API key.
     *
     * Useful for checking your remaining balance before a large batch, or for
     * surfacing consumption in your own dashboard.
     *
     * @param params - Optional: `days` of history to summarise (default 30)
     * @returns Request counts per engine, plus the workspace credit balance
     */
    usage(params?: UsageParams): Promise<UsageResponse>;
}
//# sourceMappingURL=index.d.ts.map