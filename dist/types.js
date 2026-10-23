"use strict";
// TypeScript SDK for Serpex — the web search API and extract API for AI agents
// Types and interfaces. Every shape here is checked against the Serpex API
// (POST/GET /api/search, POST /api/crawl, GET /api/usage).
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiException = void 0;
exports.errorMessageFrom = errorMessageFrom;
/** Statuses that are worth retrying: rate limit, our side, and the CDN's 52x timeouts. */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);
/** Default message per status, used when the response body carries none. */
const STATUS_MESSAGES = {
    400: "Bad request",
    401: "Invalid or missing API key",
    402: "Insufficient credits",
    403: "Not included in your plan",
    404: "Not found",
    410: "No longer available",
    429: "Rate limit exceeded",
    500: "Internal server error",
    502: "Extraction service error",
    503: "Temporarily unavailable",
    504: "Timed out upstream",
};
/** Human-readable message for an error body, never "[object Object]". */
function errorMessageFrom(body, status) {
    if (body && typeof body === "object") {
        const b = body;
        if (typeof b.error === "string" && b.error.length > 0) {
            // Framework 404s put the useful text in `message`, `error` is "Not Found".
            if (status === 404 && typeof b.message === "string" && b.message)
                return b.message;
            return b.error;
        }
        if (b.error && typeof b.error === "object") {
            const m = b.error.message;
            if (typeof m === "string" && m.length > 0)
                return m;
        }
        if (typeof b.message === "string" && b.message.length > 0)
            return b.message;
    }
    if (status !== undefined) {
        return STATUS_MESSAGES[status] ?? `Serpex API error (HTTP ${status})`;
    }
    return "API request failed";
}
class SerpApiException extends Error {
    constructor(message, statusCode, details, extra = {}) {
        super(message);
        this.name = "SerpApiException";
        this.statusCode = statusCode;
        this.details = details;
        const body = details && typeof details === "object" ? details : {};
        if (typeof body.retryable === "boolean") {
            this.retryable = body.retryable;
        }
        else if (extra.retryable !== undefined) {
            this.retryable = extra.retryable;
        }
        else {
            this.retryable = statusCode === undefined || RETRYABLE_STATUSES.has(statusCode);
        }
        this.retryAfterMs =
            typeof body.retryAfterMs === "number" ? body.retryAfterMs : extra.retryAfterMs;
        if (typeof body.request_id === "string")
            this.requestId = body.request_id;
        if (extra.cause !== undefined)
            this.cause = extra.cause;
    }
}
exports.SerpApiException = SerpApiException;
//# sourceMappingURL=types.js.map