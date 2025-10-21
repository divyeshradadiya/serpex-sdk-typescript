import { SearchResponse, SearchParams, SerpApiException } from './types';
export { SearchResponse, SearchParams, SerpApiException };
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
     * @param params - Search parameters including query, engine, category, time_range
     * @returns Search results
     */
    search(params: SearchParams): Promise<SearchResponse>;
}
//# sourceMappingURL=index.d.ts.map