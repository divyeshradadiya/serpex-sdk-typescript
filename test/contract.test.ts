// Contract tests: every fixture under test/fixtures is a sanitized response
// captured from api.serpex.dev on 2026-10-23 (or, for statuses that cannot be
// triggered safely, the exact body from the backend code). manifest.json holds
// the status code and headers of each one. No network, fetch is stubbed.
import * as fs from "fs";
import * as path from "path";
import {
  SerpexClient,
  SerpApiException,
  SearchResult,
  ExtractResult,
  UsageRecentRequest,
} from "../src/index";

const FIXTURES = path.join(__dirname, "fixtures");
const manifest: Record<string, { status: number; headers: Record<string, string> }> = JSON.parse(
  fs.readFileSync(path.join(FIXTURES, "manifest.json"), "utf8")
);

function fixture(name: string): any {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, `${name}.json`), "utf8"));
}

type Call = { url: string; init: any };

/** Stub fetch with one fixture: real status, real headers, real body. */
function serve(name: string): Call[] {
  const calls: Call[] = [];
  const { status, headers } = manifest[name];
  const body = fixture(name);
  (globalThis as any).fetch = jest.fn(async (url: string, init: any) => {
    calls.push({ url, init });
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: "",
      headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
      json: async () => body,
    };
  });
  return calls;
}

const client = () => new SerpexClient("test-key", "https://example.invalid");

afterEach(() => jest.restoreAllMocks());

describe("search", () => {
  it("plain search: typed metadata, no content keys, only q is sent", async () => {
    const calls = serve("search_plain");
    const res = await client().search({ q: "python asyncio tutorial" });
    expect(new URL(calls[0].url).search).toBe("?q=python+asyncio+tutorial");
    expect(res.metadata.status).toBe("success");
    expect(res.metadata.credits_used).toBe(1);
    expect(res.metadata.content_requested).toBeUndefined();
    expect(res.results).toHaveLength(10);
    for (const r of res.results) {
      expect(r.content).toBeUndefined();
      expect(r.content_error).toBeUndefined();
      expect(typeof r.title).toBe("string");
      expect(typeof r.position).toBe("number");
    }
  });

  it("legacy options are accepted, never sent, and the repeat is free", async () => {
    const calls = serve("search_repeat_deprecated_engine");
    jest.spyOn(console, "warn").mockImplementation(() => {});
    const legacy: any = { q: "python asyncio tutorial", engine: "legacy-value", category: "web", time_range: "day" };
    const res = await client().search(legacy);
    const sent = new URL(calls[0].url).searchParams;
    expect([...sent.keys()]).toEqual(["q"]);
    expect(res.metadata.credits_used).toBe(0);
    expect(res.metadata.from_cache).toBe(true);
    expect(manifest.search_repeat_deprecated_engine.headers.deprecation).toBe("@1782000000");
  });

  it("include_content: content on the first 5 results only, 3 credits", async () => {
    const calls = serve("search_content");
    const res = await client().search({
      q: "what is retrieval augmented generation",
      include_content: true,
      content_results: 5,
    });
    const sent = new URL(calls[0].url).searchParams;
    expect(sent.get("include_content")).toBe("true");
    expect(sent.get("content_results")).toBe("5");
    expect(res.metadata).toMatchObject({ content_requested: 5, content_delivered: 5, credits_used: 3 });
    res.results.forEach((r: SearchResult, i: number) => {
      if (i < 5) {
        expect(typeof r.content).toBe("string");
        expect(r.content_error).toBeUndefined();
      } else {
        expect(r.content).toBeUndefined();
        expect(r.content_error).toBeUndefined();
      }
    });
  });

  it("include_content: failed fetches carry content_error, charged at the plain rate", async () => {
    serve("search_content_errors");
    const res = await client().search({ q: "x", include_content: true });
    expect(res.metadata).toMatchObject({ content_requested: 5, content_delivered: 0, credits_used: 1 });
    const withError = res.results.filter((r) => r.content_error !== undefined);
    expect(withError).toHaveLength(5);
    expect(withError[0].content_error).toBe("robots_disallowed");
    expect(withError.every((r) => r.content === undefined)).toBe(true);
  });

  it("no results: status, verification and charge fields", async () => {
    serve("search_no_results");
    const res = await client().search({ q: "x" });
    expect(res.results).toEqual([]);
    expect(res.metadata).toMatchObject({
      status: "no_results",
      no_results_verified: false,
      charged: false,
      credits_used: 0,
    });
    expect(res.message).toBe(res.metadata.message);
  });

  it("content and content_error cannot both be set (type level)", () => {
    // @ts-expect-error — mutually exclusive
    const bad: SearchResult = { title: "t", url: "u", snippet: "s", position: 1, content: "c", content_error: "timeout" };
    const ok: SearchResult = { title: "t", url: "u", snippet: "s", position: 1, content_error: "timeout" };
    expect(bad && ok).toBeTruthy();
  });
});

describe("extract", () => {
  it("markdown", async () => {
    const calls = serve("extract_markdown");
    const res = await client().extract({ urls: ["https://example.com"] });
    expect(calls[0].init.method).toBe("POST");
    expect(JSON.parse(calls[0].init.body)).toEqual({ urls: ["https://example.com"] });
    const r: ExtractResult = res.results[0];
    expect(r.success).toBe(true);
    if (r.success) expect(r.markdown).toContain("documentation examples");
    expect(res.metadata.credits_used).toBe(1);
  });

  it("html", async () => {
    const calls = serve("extract_html");
    const res = await client().extract({ urls: ["https://example.com"], format: "html" });
    expect(JSON.parse(calls[0].init.body).format).toBe("html");
    const r = res.results[0];
    if (!r.success) throw new Error("expected success");
    expect(r.html).toMatch(/^<!doctype html>/i);
    expect(r.markdown).toBeUndefined();
  });

  it("per-URL failure: error + error_type, not charged", async () => {
    serve("extract_failed_404");
    const res = await client().extract({ urls: ["https://example.com/missing"] });
    const r = res.results[0];
    expect(r.success).toBe(false);
    if (r.success) throw new Error("expected failure");
    expect(r.error_type).toBe("http");
    expect(r.status_code).toBe(404);
    expect(r.error).toBe("HTTP 404: Not Found");
    expect(res.metadata).toMatchObject({ successful_crawls: 0, failed_crawls: 1, credits_used: 0 });
  });

  it("stealth: sent, warned once (ends 2026-11-01), 5 credits", async () => {
    const calls = serve("extract_stealth");
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const c = client();
    const res = await c.extract({ urls: ["https://example.com"], stealth: true });
    await c.extract({ urls: ["https://example.com"], stealth: true });
    expect(JSON.parse(calls[0].init.body).stealth).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("2026-11-01");
    expect(res.metadata).toMatchObject({ stealth: true, credits_used: 5 });
    expect(res.results[0].stealth).toBe(true);
  });
});

describe("usage", () => {
  it("typed statistics, effective_days and recent requests", async () => {
    const calls = serve("usage_days7");
    const res = await client().usage({ days: 7 });
    expect(new URL(calls[0].url).searchParams.get("days")).toBe("7");
    expect(res.period_days).toBe(7);
    expect(res.effective_days).toBe(7);
    expect(typeof res.credits.balance).toBe("number");
    expect(Object.keys(res.statistics.engineStats).every((k) => ["search", "crawl", "stealth"].includes(k))).toBe(true);
    const recent: UsageRecentRequest[] = res.recent_requests ?? [];
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[0]).not.toHaveProperty("query");
    expect(["search", "crawl", "stealth"]).toContain(recent[0].searchEngine);
  });
});

describe("errors", () => {
  async function thrown(name: string, call: (c: SerpexClient) => Promise<unknown>): Promise<SerpApiException> {
    serve(name);
    try {
      await call(client());
    } catch (e) {
      expect(e).toBeInstanceOf(SerpApiException);
      return e as SerpApiException;
    }
    throw new Error(`${name}: expected a SerpApiException`);
  }
  const search = (c: SerpexClient) => c.search({ q: "x" });
  const extract = (c: SerpexClient) => c.extract({ urls: ["https://example.com"] });

  it.each([
    ["error_400_missing_q", 400, "Query parameter (q or query) is required", false],
    ["error_400_content_results", 400, "content_results must be 5 or 10", false],
    ["error_400_include_content", 400, "include_content must be a boolean (true or false)", false],
    ["error_401_bad_key", 401, "Invalid or inactive API key", false],
    ["error_401_no_key", 401, "API key required", false],
    ["error_402_search", 402, "Insufficient credits. Please purchase more credits to continue.", false],
    ["error_500_search", 500, "Internal server error", true],
    ["error_503_search", 503, "Search temporarily unavailable, please retry.", true],
  ])("search %s → %i", async (name, status, message, retryable) => {
    const e = await thrown(name as string, search);
    expect(e.statusCode).toBe(status);
    expect(e.message).toBe(message);
    expect(e.retryable).toBe(retryable);
    expect(e.details).toEqual(fixture(name as string));
  });

  it("429 carries limit and retryAfterMs", async () => {
    const e = await thrown("error_429", search);
    expect(e.statusCode).toBe(429);
    expect(e.retryable).toBe(true);
    expect(e.retryAfterMs).toBe(292);
    expect(e.details.limit).toBe(5);
  });

  it("500 and 502 carry request_id", async () => {
    expect((await thrown("error_500_search", search)).requestId).toMatch(/^[0-9a-f-]{36}$/);
    const e = await thrown("error_502_extract", extract);
    expect(e.retryable).toBe(true);
    expect(e.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.each([
    ["error_402_extract", 402, false],
    ["error_403_stealth_not_in_plan", 403, false],
    ["error_410_stealth_ended", 410, false],
    ["error_503_stealth_busy", 503, true],
    ["error_504_extract", 504, true],
  ])("extract %s → %i", async (name, status, retryable) => {
    const e = await thrown(name as string, extract);
    expect(e.statusCode).toBe(status);
    expect(e.retryable).toBe(retryable);
    expect(e.message).toBe(fixture(name as string).error);
  });

  it("object-shaped error body never becomes [object Object]", async () => {
    const e = await thrown("error_500_malformed_json", search);
    expect(e.message).toBe("Unexpected end of JSON input");
  });

  it("framework 404 uses its message", async () => {
    const e = await thrown("error_404_news_route", search);
    expect(e.message).toBe("Route GET:/api/search/news not found");
    expect(e.retryable).toBe(false);
  });

  it("network failure is a retryable SerpApiException", async () => {
    (globalThis as any).fetch = jest.fn(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(client().search({ q: "x" })).rejects.toMatchObject({
      name: "SerpApiException",
      statusCode: undefined,
      retryable: true,
      details: { error: "network" },
    });
  });

  it("non-JSON error body falls back to a status message", async () => {
    (globalThis as any).fetch = jest.fn(async () => ({
      ok: false,
      status: 524,
      statusText: "",
      headers: { get: () => null },
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    }));
    await expect(client().search({ q: "x" })).rejects.toMatchObject({
      statusCode: 524,
      retryable: true,
      message: "HTTP 524",
    });
  });
});
