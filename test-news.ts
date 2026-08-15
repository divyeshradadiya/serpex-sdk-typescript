import { SerpexClient } from "./src/index";

const API_KEY =
  "sk_c199e9b523303aa95a4c72fe81af2b03fdf7f2c82868e7806066ed5ba006f4ba";

async function testNewsSearch() {
  console.log("Testing TypeScript SDK - News Search...\n");

  const client = new SerpexClient(API_KEY, "https://api.serpex.dev");

  try {
    // Test news search
    console.log("1. Testing news search with Google:");
    const newsResults = await client.search({
      q: "artificial intelligence",
      engine: "google",
      category: "news",
    });

    console.log("✓ News search successful!");
    console.log("Query:", newsResults.query);
    console.log("Engine:", newsResults.engines);
    console.log("Number of results:", newsResults.results.length);
    console.log("First result:", {
      title: newsResults.results[0]?.title,
      engine: newsResults.results[0]?.engine,
    });
    console.log("\n");

    // Test web search for comparison
    console.log("2. Testing web search for comparison:");
    const webResults = await client.search({
      q: "typescript tutorial",
      engine: "google",
      category: "web",
    });

    console.log("✓ Web search successful!");
    console.log("Query:", webResults.query);
    console.log("Engine:", webResults.engines);
    console.log("Number of results:", webResults.results.length);
    console.log("\n");

    console.log("All tests passed! ✓");
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.statusCode) {
      console.error("Status Code:", error.statusCode);
    }
    process.exit(1);
  }
}

testNewsSearch();
