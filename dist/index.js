"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpexClient = exports.SerpApiException = void 0;
const types_1 = require("./types");
Object.defineProperty(exports, "SerpApiException", { enumerable: true, get: function () { return types_1.SerpApiException; } });
class SerpexClient {
    /**
     * Create a new SerpexClient instance
     * @param apiKey - Your API key from the Serpex dashboard
     * @param baseUrl - Base URL for the API (optional, defaults to production)
     */
    constructor(apiKey, baseUrl = "https://api.serpex.dev") {
        if (!apiKey || typeof apiKey !== "string") {
            throw new Error("API key is required and must be a string");
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    }
    /**
     * Make an authenticated request to the API
     */
    async makeRequest(endpoint, params = {}, method = "GET") {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
        };
        let finalUrl = url;
        let body;
        if (method === "POST") {
            // For POST requests, send params as JSON body
            body = JSON.stringify(params);
        }
        else {
            // For GET requests, send params as query parameters
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach((v) => searchParams.append(key, v.toString()));
                    }
                    else {
                        searchParams.append(key, value.toString());
                    }
                }
            });
            if (searchParams.toString()) {
                finalUrl = `${url}?${searchParams.toString()}`;
            }
        }
        const response = await fetch(finalUrl, {
            method,
            headers,
            body,
        });
        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            }
            catch {
                // If we can't parse the error response, use the status text
                errorData = { error: response.statusText };
            }
            throw new types_1.SerpApiException(errorData.error || "API request failed", response.status, errorData);
        }
        return response.json();
    }
    /**
     * Run a real-time web search.
     *
     * `params.engine` is deprecated and ignored (not sent to the API).
     * @param params - Search parameters including query
     * @returns Search results
     */
    async search(params) {
        if (!params.q) {
            throw new Error("Query parameter (q) is required");
        }
        if (typeof params.q !== "string" || params.q.trim().length === 0) {
            throw new Error("Query must be a non-empty string");
        }
        if (params.q.length > 500) {
            throw new Error("Query too long (max 500 characters)");
        }
        if (params.content_results !== undefined &&
            params.content_results !== 5 &&
            params.content_results !== 10) {
            throw new Error("content_results must be exactly 5 or 10");
        }
        const requestParams = {
            q: params.q,
        };
        if (params.include_content !== undefined) {
            requestParams.include_content = params.include_content;
        }
        if (params.content_results !== undefined) {
            requestParams.content_results = params.content_results;
        }
        return this.makeRequest("/api/search", requestParams);
    }
    /**
     * Extract page content (markdown or HTML) from up to 10 URLs
     * @param params - Extraction parameters including the URLs to extract
     * @returns Extraction results
     */
    async extract(params) {
        if (!params.urls ||
            !Array.isArray(params.urls) ||
            params.urls.length === 0) {
            throw new Error("URLs array is required and must contain at least one URL");
        }
        if (params.urls.length > 10) {
            throw new Error("Maximum 10 URLs allowed per request");
        }
        // Validate URLs
        const invalidUrls = params.urls.filter((url) => {
            try {
                new URL(url);
                return false;
            }
            catch {
                return true;
            }
        });
        if (invalidUrls.length > 0) {
            throw new Error(`Invalid URLs provided: ${invalidUrls.join(", ")}`);
        }
        // Prepare request parameters
        const requestParams = {
            urls: params.urls,
        };
        if (params.stealth !== undefined) {
            requestParams.stealth = params.stealth;
        }
        if (params.format !== undefined) {
            requestParams.format = params.format;
        }
        return this.makeRequest("/api/crawl", requestParams, "POST");
    }
    /**
     * Fetch usage statistics and the current credit balance for this API key.
     *
     * Useful for checking your remaining balance before a large batch, or for
     * surfacing consumption in your own dashboard.
     *
     * @param params - Optional: `days` of history to summarise (default 30)
     * @returns Request counts per product (`engineStats`), plus the workspace credit balance
     */
    async usage(params = {}) {
        if (params.days !== undefined) {
            if (!Number.isInteger(params.days) || params.days < 1) {
                throw new Error("days must be a positive integer");
            }
        }
        const requestParams = {};
        if (params.days !== undefined) {
            requestParams.days = params.days;
        }
        return this.makeRequest("/api/usage", requestParams);
    }
}
exports.SerpexClient = SerpexClient;
//# sourceMappingURL=index.js.map