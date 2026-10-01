"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpexClient = exports.SerpApiException = exports.STEALTH_EXTRACT_TIMEOUT_MS = exports.EXTRACT_TIMEOUT_MS = exports.SEARCH_CONTENT_TIMEOUT_MS = exports.SEARCH_TIMEOUT_MS = exports.VERSION = void 0;
const types_1 = require("./types");
Object.defineProperty(exports, "SerpApiException", { enumerable: true, get: function () { return types_1.SerpApiException; } });
/** SDK version, sent in the User-Agent header. Keep in step with package.json. */
exports.VERSION = "2.11.0";
// Client-side timeouts (ms). Each is longer than the server's own budget for
// that request, so the client never gives up on a request the server still
// finishes and bills: plain search 30 s upstream, search with include_content
// 45 s, extract 55 s, stealth extract 80 s plus up to 15 s queue. Cloudflare
// closes origin responses at ~100 s. Same values as the Python SDK.
exports.SEARCH_TIMEOUT_MS = 60000;
exports.SEARCH_CONTENT_TIMEOUT_MS = 100000;
exports.EXTRACT_TIMEOUT_MS = 100000;
exports.STEALTH_EXTRACT_TIMEOUT_MS = 120000;
/** Search params the API reads. Anything else is ignored server-side and not sent. */
const SENT_SEARCH_PARAMS = new Set(["q", "include_content", "content_results"]);
// One deprecation warning per process, not one per call.
let warnedIgnoredSearchParams = false;
class SerpexClient {
    /**
     * Create a new SerpexClient instance
     * @param apiKey - Your API key from the Serpex dashboard
     * @param baseUrl - Base URL for the API (optional, defaults to production)
     * @param options - Optional. `timeoutMs` overrides the per-call timeout for
     *   every request. When omitted, each call uses a default sized above the
     *   server's own budget: 60 s search, 100 s search with include_content,
     *   100 s extract, 120 s stealth extract.
     */
    constructor(apiKey, baseUrl = "https://api.serpex.dev", options = {}) {
        if (!apiKey || typeof apiKey !== "string") {
            throw new Error("API key is required and must be a string");
        }
        if (options.timeoutMs !== undefined &&
            (typeof options.timeoutMs !== "number" || !(options.timeoutMs > 0))) {
            throw new Error("timeoutMs must be a positive number of milliseconds");
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
        this.timeoutMs = options.timeoutMs;
    }
    /**
     * Make an authenticated request to the API
     * @param timeoutMs - Per-call default; the constructor's `timeoutMs` overrides it
     */
    async makeRequest(endpoint, params = {}, method = "GET", timeoutMs = exports.SEARCH_TIMEOUT_MS) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            // Browsers ignore this header; Node and other server runtimes send it.
            "User-Agent": `serpex-js/${exports.VERSION}`,
        };
        const timeout = this.timeoutMs ?? timeoutMs;
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
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(finalUrl, {
                method,
                headers,
                body,
                signal: controller.signal,
            });
            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                }
                catch (e) {
                    if (controller.signal.aborted)
                        throw e;
                    // If we can't parse the error response, use the status text
                    errorData = { error: response.statusText };
                }
                throw new types_1.SerpApiException(errorData.error || "API request failed", response.status, errorData);
            }
            // Read the body inside the timer too: a stalled body is a timeout.
            return await response.json();
        }
        catch (e) {
            if (controller.signal.aborted && !(e instanceof types_1.SerpApiException)) {
                throw new types_1.SerpApiException(`Request timed out after ${timeout / 1000} s`, undefined, { error: "timeout", timeoutMs: timeout });
            }
            throw e;
        }
        finally {
            clearTimeout(timer);
        }
    }
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
        if (!warnedIgnoredSearchParams) {
            const ignored = Object.keys(params).filter((k) => !SENT_SEARCH_PARAMS.has(k) &&
                params[k] !== undefined);
            if (ignored.length > 0) {
                warnedIgnoredSearchParams = true;
                console.warn(`[serpex] Deprecated: search() option(s) ${ignored
                    .map((k) => `"${k}"`)
                    .join(", ")} are ignored by the API and are not sent. ` +
                    `Remove them; they may stop being accepted in a future major version.`);
            }
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
        return this.makeRequest("/api/search", requestParams, "GET", params.include_content ? exports.SEARCH_CONTENT_TIMEOUT_MS : exports.SEARCH_TIMEOUT_MS);
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
        return this.makeRequest("/api/crawl", requestParams, "POST", params.stealth ? exports.STEALTH_EXTRACT_TIMEOUT_MS : exports.EXTRACT_TIMEOUT_MS);
    }
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