# Firecrawl Integration Guide

## Overview

This project now uses a **web-scraping based approach** with your self-hosted Firecrawl instance to fetch shadcn-svelte documentation. This replaces the previous static markdown file approach and provides always-up-to-date content directly from shadcn-svelte.com.

## Architecture

```
┌─────────────────────────────────────────┐
│  MCP Tools (shadcn-svelte-get, etc.)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Doc Fetcher Service                    │
│  (src/services/doc-fetcher.ts)          │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────┐    ┌─────────────────┐
│  Cache   │    │  Self-Hosted    │
│ Manager  │    │  Firecrawl API  │
└──────────┘    └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ shadcn-svelte   │
                │   .com (live)   │
                └─────────────────┘
```

## Components

### 1. Doc Fetcher Service (`src/services/doc-fetcher.ts`)

Handles all interactions with your Firecrawl instance:

- **`scrapeUrl(url, options)`** - Scrapes any URL using Firecrawl
- **`fetchComponentDocs(componentName)`** - Fetches specific component documentation
- **`fetchInstallationDocs(framework?)`** - Fetches installation guides
- **`fetchGeneralDocs(path)`** - Fetches any documentation page
- **`mapWebsite(url, options)`** - Discovers all URLs on a site
- **`testConnection()`** - Tests Firecrawl instance connectivity

### 2. Cache Manager (`src/services/cache-manager.ts`)

Implements two-tier caching:

- **Memory Cache**: LRU cache for fastest access (50 entries)
- **Disk Cache**: Persistent cache for longer storage (24h TTL)
- **Auto-cleanup**: Removes expired entries hourly

Features:

- `getFromCache<T>(url)` - Retrieves cached data
- `saveToCache<T>(url, data)` - Stores data in cache
- `clearCache()` - Clears all cache
- `cleanupCache()` - Removes expired entries
- `getCacheStats()` - Returns cache statistics

## Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Your Railway-hosted Firecrawl instance
FIRECRAWL_API_URL=https://api-production-fdef.up.railway.app

# API Key (if required)
FIRECRAWL_API_KEY=your-api-key-here

# Documentation base URL
SHADCN_BASE_URL=https://www.shadcn-svelte.com
```

### Firecrawl API Endpoints

Your self-hosted instance should expose these endpoints:

- `POST /v1/scrape` - Scrape a single URL
- `POST /v1/map` - Map a website to discover URLs
- `POST /v1/search` - Search the web
- `POST /v1/crawl` - Start an async crawl job

## Testing

### Test Firecrawl Connection

```bash
npm run test:firecrawl
```

This will:

1. Test connection to your Firecrawl instance
2. Fetch a sample component (Button)
3. Map the website to discover URLs
4. Show cache statistics

Expected output:

```
============================================================
Testing Firecrawl Self-Hosted Instance
============================================================

Configuration:
  API URL: https://api-production-fdef.up.railway.app
  API Key: ***xxxx
  Base URL: https://www.shadcn-svelte.com

Test 1: Testing connection...
  Status: ✓ SUCCESS
  Message: Connected to Firecrawl at https://api-production-fdef.up.railway.app

Test 2: Fetching Button component documentation...
  Status: ✓ SUCCESS
  Preview: Get Started...
  Total length: 5432 characters

Test 3: Mapping website to discover component URLs...
  Status: ✓ SUCCESS
  Found 18 URLs
  Component URLs: 15
  Sample URLs:
    - https://www.shadcn-svelte.com/docs/components/button
    - https://www.shadcn-svelte.com/docs/components/card
    ...

Test 4: Cache statistics...
  Memory cache: 2 entries
  Disk cache: 2 entries

============================================================
All tests completed!
============================================================
```

## Usage Examples

### Fetch Component Documentation

```typescript
import { fetchComponentDocs } from "./services/doc-fetcher.js";

const result = await fetchComponentDocs("button");
if (result.success) {
  console.log(result.markdown); // Clean markdown content
  console.log(result.metadata); // Page metadata
}
```

### With Caching

```typescript
import { getFromCache, saveToCache } from "./services/cache-manager.js";
import { fetchComponentDocs } from "./services/doc-fetcher.js";

const url = "button";
let docs = await getFromCache<ScrapeResult>(url);

if (!docs) {
  // Cache miss - fetch from web
  docs = await fetchComponentDocs(url);
  if (docs.success) {
    await saveToCache(url, docs);
  }
}
```

### Discover All Components

```typescript
import { mapWebsite } from "./services/doc-fetcher.js";

const result = await mapWebsite("https://www.shadcn-svelte.com", {
  search: "components",
  limit: 50,
});

if (result.success) {
  const componentUrls = result.urls.filter((url) =>
    url.includes("/docs/components/")
  );
  console.log("Found components:", componentUrls);
}
```

## Migration from Static Markdown

### Before (Static Files)

```typescript
// Read from file system
const filePath = path.join(DOCS_PATH, "components", `${name}.md`);
const content = await fs.readFile(filePath, "utf-8");
// Parse frontmatter and markdown manually
```

### After (Web Scraping)

```typescript
// Fetch from live site with caching
const result = await fetchComponentDocs(name);
// Clean markdown already extracted
const content = result.markdown;
```

## Benefits of New Approach

### ✅ Advantages

1. **Always Up-to-Date**: Content fetched from live site
2. **No MDSveX Parsing**: Firecrawl handles all complexity
3. **Simpler Maintenance**: No manual file synchronization
4. **Better Content**: Users see exactly what's on the website
5. **Efficient Caching**: Two-tier cache minimizes API calls
6. **Error Resilient**: Graceful fallbacks and error handling

### ⚠️ Considerations

1. **Network Dependency**: Requires connection to Firecrawl instance
2. **First Request Latency**: Initial fetch takes longer (then cached)
3. **API Limits**: Self-hosted instance may have rate limits

### 🔧 Mitigation Strategies

1. **Aggressive Caching**: 24-hour TTL reduces API calls
2. **Pre-warming**: Cache popular components on startup
3. **Disk Persistence**: Cache survives restarts
4. **Fallback**: Keep last known good cache state

## Troubleshooting

### Connection Issues

If `test:firecrawl` fails:

1. **Check Firecrawl URL**: Verify `FIRECRAWL_API_URL` is correct
2. **Test Railway App**: Visit your Railway URL in browser
3. **Check API Key**: If required, verify `FIRECRAWL_API_KEY`
4. **Check Endpoints**: Ensure `/v1/scrape` endpoint exists

### Empty Results

If scraping returns empty content:

1. **Check URL**: Verify the target URL is accessible
2. **Inspect Options**: Try different `excludeTags` / `includeTags`
3. **Test Manually**: Use Firecrawl playground to debug
4. **Check Logs**: Look for error messages in console

### Cache Issues

If cache isn't working:

1. **Check Permissions**: Ensure `.cache/` directory is writable
2. **Clear Cache**: Run `clearCache()` to reset
3. **Check TTL**: Expired entries are auto-removed

## Next Steps

1. ✅ Test Firecrawl connection: `npm run test:firecrawl`
2. ⏳ Migrate existing tools to use doc-fetcher service
3. ⏳ Add pre-warming for popular components
4. ⏳ Update tool descriptions and schemas
5. ⏳ Remove static markdown files
6. ⏳ Update documentation

## API Reference

### Doc Fetcher

```typescript
// Scrape any URL
scrapeUrl(url: string, options?: ScrapeOptions): Promise<ScrapeResult>

// Fetch component docs
fetchComponentDocs(componentName: string): Promise<ScrapeResult>

// Fetch installation guide
fetchInstallationDocs(framework?: string): Promise<ScrapeResult>

// Fetch any docs page
fetchGeneralDocs(path: string): Promise<ScrapeResult>

// Map website
mapWebsite(url?: string, options?: MapOptions): Promise<MapResult>

// Test connection
testConnection(): Promise<{ success: boolean; message: string }>
```

### Cache Manager

```typescript
// Get from cache
getFromCache<T>(url: string): Promise<T | null>

// Save to cache
saveToCache<T>(url: string, data: T): Promise<void>

// Clear all cache
clearCache(): Promise<void>

// Cleanup expired entries
cleanupCache(): Promise<void>

// Get statistics
getCacheStats(): Promise<CacheStats>
```

## Support

For issues or questions:

1. Check this README
2. Review test output: `npm run test:firecrawl`
3. Check Firecrawl docs: https://docs.firecrawl.dev
4. Review Railway deployment logs
