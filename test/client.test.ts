// Offline tests — no network, no API key. fetch is stubbed.
import { SerpexClient, SearchParams, VERSION } from "../src/index";

type Call = { url: string; init: any };

function stubFetch(body: any = { metadata: {}, id: "x", query: "q", engines: ["auto"], results: [] }) {
  const calls: Call[] = [];
  (globalThis as any).fetch = jest.fn(async (url: string, init: any) => {
    calls.push({ url, init });
    return { ok: true, status: 200, json: async () => body };
  });
  return calls;
}

describe("SerpexClient.search", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("still accepts the deprecated engine options, does not send them, and warns once", async () => {
    const calls = stubFetch();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const client = new SerpexClient("test-key", "https://example.invalid");
    const params: SearchParams = { q: "hello", engine: "legacy-value", engines: ["a", "b"] };
    await client.search(params);
    await client.search(params);
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toContain("q=hello");
    expect(calls[0].url).not.toContain("engine");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"engine"');
  });

  it("sends include_content and content_results when set", async () => {
    const calls = stubFetch();
    const client = new SerpexClient("test-key", "https://example.invalid");
    await client.search({ q: "hello", include_content: true, content_results: 10 });
    expect(calls[0].url).toContain("include_content=true");
    expect(calls[0].url).toContain("content_results=10");
  });

  it("sends the SDK User-Agent", async () => {
    const calls = stubFetch();
    const client = new SerpexClient("test-key", "https://example.invalid");
    await client.search({ q: "hello" });
    expect(VERSION).toBe("2.11.0");
    expect(calls[0].init.headers["User-Agent"]).toBe("serpex-js/2.11.0");
  });

  it("parses a response without the deprecated engine fields", async () => {
    stubFetch({
      metadata: { number_of_results: 1, response_time: 1, timestamp: "t", credits_used: 1 },
      id: "x",
      query: "hello",
      results: [{ title: "T", url: "https://a.example", snippet: "s", position: 1 }],
    });
    const client = new SerpexClient("test-key", "https://example.invalid");
    const res = await client.search({ q: "hello" });
    expect(res.engines).toBeUndefined();
    expect(res.results[0].engine).toBeUndefined();
    expect(res.results[0].title).toBe("T");
  });

  it("passes an abort signal and turns a timeout into SerpApiException", async () => {
    (globalThis as any).fetch = jest.fn(
      (_url: string, init: any) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            const e = new Error("aborted");
            e.name = "AbortError";
            reject(e);
          });
        })
    );
    const client = new SerpexClient("test-key", "https://example.invalid", { timeoutMs: 10 });
    await expect(client.search({ q: "hello" })).rejects.toMatchObject({
      name: "SerpApiException",
      details: { error: "timeout", timeoutMs: 10 },
    });
  });

  it("rejects a non-positive timeout override", () => {
    expect(() => new SerpexClient("test-key", undefined, { timeoutMs: 0 })).toThrow();
  });

  it("keeps the public methods", () => {
    const client = new SerpexClient("test-key");
    expect(typeof client.search).toBe("function");
    expect(typeof client.extract).toBe("function");
    expect(typeof client.usage).toBe("function");
  });
});
