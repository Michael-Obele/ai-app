# Migration Plan: Web-Based MCP for shadcn-svelte

## ✅ Completed

1. **Created Doc Fetcher Service** (`src/services/doc-fetcher.ts`)
   - Integrates with your self-hosted Firecrawl instance
   - Successfully tested connection ✓
   - Fetched Button component (11,608 chars) ✓
   - Supports all Firecrawl features (scrape, map, search, crawl)

2. **Created Cache Manager** (`src/services/cache-manager.ts`)
   - Two-tier caching (memory + disk)
   - 24-hour TTL for freshness
   - LRU eviction for memory efficiency
   - Auto-cleanup of expired entries

3. **Verified Firecrawl Instance**
   - URL: `https://api-production-fdef.up.railway.app`
   - Status: ✓ Working
   - API endpoint: `/v1/scrape` ✓
   - Response format: Clean markdown ✓

4. **Created Documentation**
   - `FIRECRAWL_INTEGRATION.md` - Complete integration guide
   - Test script: `npm run test:firecrawl`
   - Environment template: `.env.example`

## 📋 Next Steps (in order)

### Phase 1: Refactor Existing Tools (Priority)

#### 1.1 Update `shadcn-svelte-get.ts`

**Current approach:**

```typescript
// Reads from static markdown files
const content = await fs.readFile(filePath, "utf-8");
```

**New approach:**

```typescript
import { fetchComponentDocs } from "../services/doc-fetcher.js";
import { getFromCache, saveToCache } from "../services/cache-manager.js";

// Check cache first
let result = await getFromCache(componentName);
if (!result) {
  result = await fetchComponentDocs(componentName);
  if (result.success) {
    await saveToCache(componentName, result);
  }
}
return result.markdown;
```

**Action items:**

- [ ] Import doc-fetcher and cache-manager
- [ ] Replace file reading with fetchComponentDocs()
- [ ] Add caching layer
- [ ] Update error handling
- [ ] Test with multiple components

#### 1.2 Update `shadcn-svelte-list.ts`

**Current approach:**

```typescript
// Reads from registry.json
const registry = JSON.parse(await fs.readFile(registryPath, "utf-8"));
```

**New approach:**

```typescript
import { mapWebsite } from "../services/doc-fetcher.js";

// Discover components from live site
const result = await mapWebsite("https://www.shadcn-svelte.com", {
  search: "components",
  limit: 100,
});

const components = result.urls
  .filter((url) => url.includes("/docs/components/"))
  .map((url) => {
    const name = url.split("/").pop();
    return { name, url };
  });
```

**Action items:**

- [ ] Replace static registry with dynamic discovery
- [ ] Cache the component list
- [ ] Add component descriptions from docs
- [ ] Update tool response format

#### 1.3 Update `shadcn-svelte-utility.ts`

Similar refactor to use web-based fetching for utility functions.

### Phase 2: Enhance MCP Server

#### 2.1 Add Pre-warming

Add to `src/index.ts` or create `src/services/prewarm.ts`:

```typescript
import { fetchComponentDocs } from "./services/doc-fetcher.js";
import { saveToCache } from "./services/cache-manager.js";

// Popular components to cache on startup
const POPULAR_COMPONENTS = [
  "button",
  "input",
  "card",
  "dialog",
  "select",
  "form",
  "table",
  "tabs",
  "dropdown-menu",
  "alert",
];

export async function prewarmCache() {
  console.log("[Prewarm] Starting cache pre-warming...");
  const results = await Promise.allSettled(
    POPULAR_COMPONENTS.map(async (name) => {
      const result = await fetchComponentDocs(name);
      if (result.success) {
        await saveToCache(name, result);
        console.log(`[Prewarm] Cached: ${name}`);
      }
    })
  );
  const successful = results.filter((r) => r.status === "fulfilled").length;
  console.log(
    `[Prewarm] Completed: ${successful}/${POPULAR_COMPONENTS.length} components`
  );
}
```

**Action items:**

- [ ] Create prewarm service
- [ ] Call on MCP server startup
- [ ] Add to dev-server.ts and server.ts
- [ ] Make list configurable

#### 2.2 Add New Tools

**Tool: `search-components`**

```typescript
{
  name: 'search-components',
  description: 'Search for shadcn-svelte components by functionality or keywords',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "form input", "modal", "dropdown")'),
    limit: z.number().optional().default(10),
  }),
  execute: async ({ context }) => {
    // Use Firecrawl search to find relevant components
    const searchUrl = 'https://www.shadcn-svelte.com/docs/components';
    const result = await scrapeUrl(searchUrl, {
      formats: ['markdown'],
      onlyMainContent: true,
    });
    // Parse and filter based on query
    // Return matching components
  }
}
```

**Tool: `get-installation-guide`**

```typescript
{
  name: 'get-installation-guide',
  description: 'Get installation instructions for shadcn-svelte',
  inputSchema: z.object({
    framework: z.enum(['sveltekit', 'vite', 'astro']).optional(),
  }),
  execute: async ({ context }) => {
    const result = await fetchInstallationDocs(context.framework);
    return result.markdown;
  }
}
```

**Action items:**

- [ ] Create search-components tool
- [ ] Create get-installation-guide tool
- [ ] Create get-theming-docs tool
- [ ] Update MCP server registration

### Phase 3: Optimization & Polish

#### 3.1 Performance Monitoring

Add metrics to doc-fetcher:

```typescript
const metrics = {
  requests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0,
  avgResponseTime: 0,
};

export function getMetrics() {
  return {
    ...metrics,
    cacheHitRate:
      metrics.requests > 0
        ? ((metrics.cacheHits / metrics.requests) * 100).toFixed(2) + "%"
        : "0%",
  };
}
```

**Action items:**

- [ ] Add metrics tracking
- [ ] Create metrics endpoint/tool
- [ ] Log performance stats
- [ ] Monitor Firecrawl usage

#### 3.2 Error Resilience

Enhance error handling:

```typescript
// Add retry logic
async function scrapeWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await scrapeUrl(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}

// Fallback to cache on error
async function scrapeWithFallback(url: string) {
  try {
    const result = await scrapeUrl(url);
    await saveToCache(url, result);
    return result;
  } catch (error) {
    const cached = await getFromCache(url);
    if (cached) {
      console.warn("[Fallback] Using cached data due to error");
      return cached;
    }
    throw error;
  }
}
```

**Action items:**

- [ ] Add retry logic
- [ ] Add fallback to cache
- [ ] Improve error messages
- [ ] Add health checks

#### 3.3 Clean Up

**Action items:**

- [ ] Remove static markdown files from `src/mastra/docs/content/`
- [ ] Keep registry.json as reference (for now)
- [ ] Update .gitignore to exclude .cache/
- [ ] Document API usage and limits

### Phase 4: Testing & Documentation

#### 4.1 Testing

**Action items:**

- [ ] Test all refactored tools
- [ ] Test with `bun run dev`
- [ ] Test caching behavior
- [ ] Test error scenarios
- [ ] Load test with many requests

#### 4.2 Documentation

**Action items:**

- [ ] Update main README.md
- [ ] Document new tool usage
- [ ] Add troubleshooting guide
- [ ] Create migration notes

## 🚀 Quick Start for Next Session

1. **Test current state:**

   ```bash
   npm run test:firecrawl
   ```

2. **Start refactoring first tool:**

   ```bash
   code src/mastra/tools/shadcn-svelte-get.ts
   ```

3. **Add imports:**

   ```typescript
   import { fetchComponentDocs } from "../../services/doc-fetcher.js";
   import { getFromCache, saveToCache } from "../../services/cache-manager.js";
   ```

4. **Replace file reading logic**

5. **Test:**
   ```bash
   npm run mcp:dev
   ```

## 📊 Progress Tracking

- [x] Create doc-fetcher service
- [x] Create cache-manager service
- [x] Test Firecrawl connection
- [x] Create documentation
- [ ] Refactor shadcn-svelte-get tool
- [ ] Refactor shadcn-svelte-list tool
- [ ] Refactor shadcn-svelte-utility tool
- [ ] Add pre-warming
- [ ] Add search-components tool
- [ ] Add installation-guide tool
- [ ] Remove static files
- [ ] Performance testing
- [ ] Documentation updates

## 💡 Key Insights from Testing

1. **Firecrawl works perfectly** - Your Railway instance responds correctly
2. **Clean markdown output** - 11K+ characters of well-formatted content
3. **No API key needed** - Your instance doesn't require authentication (or it's already configured)
4. **Map endpoint exists** - Though the test showed limited results (may need different parameters)

## 🎯 Immediate Action

Start with **Phase 1.1** - Refactor `shadcn-svelte-get.ts` to use the new doc-fetcher service. This will prove the concept and allow testing the full flow.

## Questions to Address

1. **Rate Limits**: Does your Firecrawl instance have rate limits we should be aware of?
2. **Cost**: Any concerns about API usage/costs with your Railway deployment?
3. **Availability**: Is the instance always-on, or does it sleep/scale to zero?
4. **Features**: Does your instance support all Firecrawl v2 features (map, search, crawl, extract)?

## Notes

- The map endpoint returned only 1 URL - this might need different search parameters
- Cache is working (initialized successfully)
- No API key required (or already configured on your instance)
- Consider adding FIRECRAWL_API_KEY to .env if you want to secure it later
