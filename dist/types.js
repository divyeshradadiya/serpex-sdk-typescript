"use strict";
// TypeScript SDK for Serpex SERP API
// Types and interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpApiException = void 0;
class SerpApiException extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.name = 'SerpApiException';
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.SerpApiException = SerpApiException;
//# sourceMappingURL=types.js.map