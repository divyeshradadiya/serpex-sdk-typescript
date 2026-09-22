// Offline tests — no network, no API key. fetch is stubbed.
import { SerpexClient, SearchParams } from "../src/index";

function stubFetch() {
  const calls: string[] = [];
  (globalThis as any).fetch = jest.fn(async (url: string) => {
    calls.push(url);
    return {
      ok: true,
      status: 200,
      json: async () => ({ metadata: {}, id: "x", query: "q", engines: ["auto"], results: [] }),
    };
  });
  return calls;
}

describe("SerpexClient.search", () => {
  it("still accepts the deprecated engine option and does not send it", async () => {
    const calls = stubFetch();
    const client = new SerpexClient("test-key", "https://example.invalid");
    const params: SearchParams = { q: "hello", engine: "legacy-value" };
    await client.search(params);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("q=hello");
    expect(calls[0]).not.toContain("engine");
  });

  it("keeps the public methods", () => {
    const client = new SerpexClient("test-key");
    expect(typeof client.search).toBe("function");
    expect(typeof client.extract).toBe("function");
    expect(typeof client.usage).toBe("function");
  });
});
