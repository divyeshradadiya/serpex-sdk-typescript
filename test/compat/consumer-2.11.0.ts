// Backward-compatibility check: code written against serpex 2.11.0 must keep
// compiling. `npm run typecheck:compat` compiles this file against the source
// of this version (tsconfig maps "serpex" to ../../src); it also compiles
// unchanged against the published serpex@2.11.0. It only type-checks; nothing
// here runs.
import {
  SerpexClient,
  SerpApiException,
  SearchResponse,
  SearchParams,
  ExtractResponse,
  ExtractParams,
  UsageParams,
  UsageResponse,
  SerpexClientOptions,
  StealthErrorCode,
} from "serpex";

type SearchResult = SearchResponse["results"][number];
type ExtractResult = ExtractResponse["results"][number];
type SearchMetadata = SearchResponse["metadata"];

// Extending the result types, as 2.11.0 interfaces allowed.
interface RankedResult extends SearchResult {
  rank: number;
}
interface StoredExtract extends ExtractResult {
  storedAt: string;
}

// Hand-built objects (test mocks) in the 2.11.0 shape.
const result: SearchResult = {
  title: "t",
  url: "https://example.com",
  snippet: "s",
  position: 1,
  engine: "auto",
  content: "c",
  content_error: "timeout",
};
const ranked: RankedResult = { ...result, rank: 1 };

const metadata: SearchMetadata = {
  number_of_results: 1,
  response_time: 10,
  timestamp: "2026-10-23T00:00:00.000Z",
  credits_used: 1,
  status: "success",
};
const statusText: string = metadata.status ?? "unknown";
const failed = metadata.status === "error";

const search: SearchResponse = {
  metadata,
  id: "id",
  query: "q",
  engines: ["auto"],
  results: [result, ranked],
};

const extracted: ExtractResult = {
  url: "https://example.com",
  success: true,
  markdown: "# Page",
  error: "",
  error_type: "http",
  status_code: 200,
};
const stored: StoredExtract = { ...extracted, storedAt: "now" };
const extract: ExtractResponse = {
  success: true,
  results: [extracted, stored],
  metadata: {
    total_urls: 1,
    processed_urls: 1,
    successful_crawls: 1,
    failed_crawls: 0,
    credits_used: 1,
    response_time: 10,
    timestamp: "2026-10-23T00:00:00.000Z",
  },
};

const usage: UsageResponse = {
  api_key: "key name",
  organization_id: "org",
  period_days: 30,
  statistics: {
    totalRequests: 1,
    successfulRequests: 1,
    failedRequests: 0,
    engineStats: { search: 1 },
  },
  credits: { balance: 10, totalUsed: 1 },
  recent_requests: [{ id: 1, status: "success", anything: "else" }],
};
const searches: number = usage.statistics.engineStats["search"] ?? 0;
const lastQuery: unknown = usage.recent_requests?.[0]?.query;
// Known recent_requests fields are typed since 2.12.0 (they were `any`), so
// assigning one to a non-optional variable now needs a default, e.g.
// `const s: string = usage.recent_requests?.[0]?.status ?? ""`. Inferred reads
// like this one compile on both versions.
const lastStatus = usage.recent_requests?.[0]?.status;

// Reading fields as 2.11.0 code did.
function render(r: SearchResult): string {
  const body: string = r.content ?? r.content_error ?? r.snippet;
  return `${r.position}. ${r.title} ${r.url} ${body}`;
}
function extractText(r: ExtractResult): string {
  if (!r.success) return `${r.error_type?.toUpperCase()}: ${r.error ?? ""} ${r.error_code ?? ""}`;
  return r.markdown ?? r.html ?? "";
}
const code: StealthErrorCode = "stealth_timeout";

async function main(): Promise<void> {
  const options: SerpexClientOptions = { timeoutMs: 30_000 };
  const client = new SerpexClient("sk_test", "https://api.serpex.dev", options);
  const params: SearchParams = { q: "q", include_content: true, content_results: 5, engine: "auto" };
  const extractParams: ExtractParams = { urls: ["https://example.com"], format: "markdown", stealth: false };
  const usageParams: UsageParams = { days: 7 };
  try {
    const res = await client.search(params);
    res.results.map(render);
    (await client.extract(extractParams)).results.map(extractText);
    const u = await client.usage(usageParams);
    u.credits.balance.toFixed(0);
  } catch (e) {
    if (e instanceof SerpApiException) {
      const status: number | undefined = e.statusCode;
      const details: any = e.details;
      const wait: number | undefined = details?.retryAfterMs;
      const message: string = e.message;
      void [status, wait, message];
    }
  }
  const manual = new SerpApiException("boom", 400, { error: "bad" });
  void manual;
}

void [statusText, failed, search, extract, searches, lastQuery, lastStatus, code, main];
