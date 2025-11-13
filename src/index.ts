import {
  SearchResponse,
  SearchParams,
  ExtractResponse,
  ExtractParams,
  SerpApiException
} from './types';

export { SearchResponse, SearchParams, ExtractResponse, ExtractParams, SerpApiException };

export class SerpexClient {
  private baseUrl: string;
  private apiKey: string;

  /**
   * Create a new SerpexClient instance
   * @param apiKey - Your API key from the Serpex dashboard
   * @param baseUrl - Base URL for the API (optional, defaults to production)
   */
  constructor(apiKey: string, baseUrl: string = 'https://api.serpex.dev') {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is required and must be a string');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Make an authenticated request to the API
   */
  private async makeRequest(endpoint: string, params: Record<string, any> = {}, method: string = 'GET'): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    let finalUrl = url;
    let body: string | undefined;

    if (method === 'POST') {
      // For POST requests, send params as JSON body
      body = JSON.stringify(params);
    } else {
      // For GET requests, send params as query parameters
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
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
      body
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If we can't parse the error response, use the status text
        errorData = { error: response.statusText };
      }

      throw new SerpApiException(
        errorData.error || 'API request failed',
        response.status,
        errorData
      );
    }

    return response.json();
  }

  /**
   * Search using the SERP API
   * @param params - Search parameters including query, engine, category, time_range
   * @returns Search results
   */
  async search(params: SearchParams): Promise<SearchResponse> {
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
    const requestParams: Record<string, any> = {
      q: params.q,
      engine: params.engine || 'auto', // Default to auto
      category: params.category || 'web',
      time_range: params.time_range || 'all',
      format: params.format || 'json'
    };

    return this.makeRequest('/api/search', requestParams);
  }

  /**
   * Extract content from web pages
   * @param params - Extraction parameters including URLs to scrape
   * @returns Extraction results
   */
  async extract(params: ExtractParams): Promise<ExtractResponse> {
    if (!params.urls || !Array.isArray(params.urls) || params.urls.length === 0) {
      throw new Error('URLs array is required and must contain at least one URL');
    }

    if (params.urls.length > 10) {
      throw new Error('Maximum 10 URLs allowed per request');
    }

    // Validate URLs
    const invalidUrls = params.urls.filter(url => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      throw new Error(`Invalid URLs provided: ${invalidUrls.join(', ')}`);
    }

    // Prepare request parameters
    const requestParams: Record<string, any> = {
      urls: params.urls
    };

    return this.makeRequest('/api/crawl', requestParams, 'POST');
  }
}