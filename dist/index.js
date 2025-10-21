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
    constructor(apiKey, baseUrl = 'https://api.serpex.dev') {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API key is required and must be a string');
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    /**
     * Make an authenticated request to the API
     */
    async makeRequest(endpoint, params = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        // Build query string from params
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => searchParams.append(key, v.toString()));
                }
                else {
                    searchParams.append(key, value.toString());
                }
            }
        });
        const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers
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
            throw new types_1.SerpApiException(errorData.error || 'API request failed', response.status, errorData);
        }
        return response.json();
    }
    /**
     * Search using the SERP API
     * @param params - Search parameters including query, engine, category, time_range
     * @returns Search results
     */
    async search(params) {
        if (!params.q) {
            throw new Error('Query parameter (q) is required');
        }
        if (typeof params.q !== 'string' || params.q.trim().length === 0) {
            throw new Error('Query must be a non-empty string');
        }
        if (params.q.length > 500) {
            throw new Error('Query too long (max 500 characters)');
        }
        // Prepare request parameters with only supported params
        const requestParams = {
            q: params.q,
            engine: params.engine || 'google', // Default to google
            category: params.category || 'general',
            time_range: params.time_range || 'all',
            format: params.format || 'json'
        };
        return this.makeRequest('/api/search', requestParams);
    }
}
exports.SerpexClient = SerpexClient;
//# sourceMappingURL=index.js.map