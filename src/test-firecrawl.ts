/**
 * Test script for Firecrawl self-hosted instance
 * Tests connection and basic functionality
 */

import {
  testConnection,
  fetchComponentDocs,
  mapWebsite,
  config,
} from "./services/doc-fetcher.js";
import { getCacheStats, clearCache } from "./services/cache-manager.js";

async function main() {
  console.log("=".repeat(60));
  console.log("Testing Firecrawl Self-Hosted Instance");
  console.log("=".repeat(60));
  console.log(`\nConfiguration:`);
  console.log(`  API URL: ${config.FIRECRAWL_API_URL}`);
  console.log(
    `  API Key: ${config.FIRECRAWL_API_KEY ? "***" + config.FIRECRAWL_API_KEY.slice(-4) : "NOT SET"}`
  );
  console.log(`  Base URL: ${config.SHADCN_BASE_URL}`);
  console.log();

  // Test 1: Connection
  console.log("Test 1: Testing connection...");
  const connectionResult = await testConnection();
  console.log(
    `  Status: ${connectionResult.success ? "✓ SUCCESS" : "✗ FAILED"}`
  );
  console.log(`  Message: ${connectionResult.message}`);
  console.log();

  if (!connectionResult.success) {
    console.error("Connection failed. Please check:");
    console.error("  1. FIRECRAWL_API_URL is set correctly");
    console.error("  2. FIRECRAWL_API_KEY is set correctly (if required)");
    console.error("  3. Your Firecrawl instance is running and accessible");
    process.exit(1);
  }

  // Test 2: Fetch component documentation
  console.log("Test 2: Fetching Button component documentation...");
  const buttonDocs = await fetchComponentDocs("button");
  console.log(`  Status: ${buttonDocs.success ? "✓ SUCCESS" : "✗ FAILED"}`);
  if (buttonDocs.success) {
    const previewLength = 200;
    const preview =
      buttonDocs.markdown?.slice(0, previewLength) || "No content";
    console.log(`  Preview: ${preview}...`);
    console.log(
      `  Total length: ${buttonDocs.markdown?.length || 0} characters`
    );
  } else {
    console.log(`  Error: ${buttonDocs.error}`);
  }
  console.log();

  // Test 3: Map website for component URLs
  console.log("Test 3: Mapping website to discover component URLs...");
  const mapResult = await mapWebsite(config.SHADCN_BASE_URL, {
    search: "components",
    limit: 20,
  });
  console.log(`  Status: ${mapResult.success ? "✓ SUCCESS" : "✗ FAILED"}`);
  if (mapResult.success) {
    console.log(`  Found ${mapResult.urls.length} URLs`);
    const componentUrls = mapResult.urls.filter((url) =>
      url.includes("/components/")
    );
    console.log(`  Component URLs: ${componentUrls.length}`);
    if (componentUrls.length > 0) {
      console.log(`  Sample URLs:`);
      componentUrls.slice(0, 5).forEach((url) => {
        console.log(`    - ${url}`);
      });
    }
  } else {
    console.log(`  Error: ${mapResult.error}`);
  }
  console.log();

  // Test 4: Cache statistics
  console.log("Test 4: Cache statistics...");
  const stats = await getCacheStats();
  console.log(`  Memory cache: ${stats.memorySize} entries`);
  console.log(`  Disk cache: ${stats.diskSize} entries`);
  console.log();

  console.log("=".repeat(60));
  console.log("All tests completed!");
  console.log("=".repeat(60));
  console.log("\nNext steps:");
  console.log("  1. Review the test results above");
  console.log(
    "  2. If successful, start migrating the MCP tools to use doc-fetcher.ts"
  );
  console.log("  3. Run: npm run mcp:dev to test the MCP server");
  console.log();
}

main().catch(console.error);
