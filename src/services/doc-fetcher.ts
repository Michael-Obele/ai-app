/**
 * Documentation Fetcher Service
 * Fetches documentation from shadcn-svelte.com using Firecrawl API
 */

import { z } from "zod";

// Configuration
const FIRECRAWL_API_URL = process.env.FIRECRAWL_API_URL;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "";
const SHADCN_BASE_URL = "https://www.shadcn-svelte.com";

// Types
export interface ScrapeOptions {
  formats?: Array<"markdown" | "html" | "rawHtml" | "links">;
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
  timeout?: number;
}

export interface ScrapeResult {
  url: string;
  markdown?: string;
  html?: string;
  metadata?: Record<string, any>;
  success: boolean;
  error?: string;
}

/**
 * Scrapes a URL using the self-hosted Firecrawl instance
 */
export async function scrapeUrl(
  url: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResult> {
  try {
    const response = await fetch(`${FIRECRAWL_API_URL}/v1/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: options.formats || ["markdown"],
        onlyMainContent: options.onlyMainContent ?? true,
        includeTags: options.includeTags,
        excludeTags: options.excludeTags,
        waitFor: options.waitFor,
        timeout: options.timeout || 30000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return {
      url,
      markdown: data.data?.markdown || data.markdown,
      html: data.data?.html || data.html,
      metadata: data.data?.metadata || data.metadata,
      success: true,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      url,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetches component documentation from shadcn-svelte.com
 */
export async function fetchComponentDocs(
  componentName: string
): Promise<ScrapeResult> {
  const url = `${SHADCN_BASE_URL}/docs/components/${componentName}`;
  return scrapeUrl(url, {
    formats: ["markdown"],
    onlyMainContent: true,
    excludeTags: ["nav", "footer", "aside"],
  });
}

/**
 * Fetches installation guide documentation
 */
export async function fetchInstallationDocs(
  framework?: string
): Promise<ScrapeResult> {
  const path = framework
    ? `/docs/installation/${framework}`
    : "/docs/installation";
  const url = `${SHADCN_BASE_URL}${path}`;
  return scrapeUrl(url, {
    formats: ["markdown"],
    onlyMainContent: true,
  });
}

/**
 * Fetches general documentation page
 */
export async function fetchGeneralDocs(path: string): Promise<ScrapeResult> {
  const url = `${SHADCN_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return scrapeUrl(url, {
    formats: ["markdown"],
    onlyMainContent: true,
  });
}

/**
 * Maps a website to discover all URLs
 */
export async function mapWebsite(
  url: string = SHADCN_BASE_URL,
  options: {
    search?: string;
    limit?: number;
    includeSubdomains?: boolean;
  } = {}
): Promise<{ urls: string[]; success: boolean; error?: string }> {
  try {
    const response = await fetch(`${FIRECRAWL_API_URL}/v1/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        search: options.search,
        limit: options.limit || 100,
        includeSubdomains: options.includeSubdomains ?? false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const urls = data.links?.map((link: any) => link.url || link) || [];

    return {
      urls,
      success: true,
    };
  } catch (error) {
    console.error(`Error mapping ${url}:`, error);
    return {
      urls: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Tests the connection to the self-hosted Firecrawl instance
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Try a simple scrape to test the connection
    const result = await scrapeUrl(`${SHADCN_BASE_URL}/docs`, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 10000,
    });

    if (result.success && result.markdown) {
      return {
        success: true,
        message: `Connected to Firecrawl at ${FIRECRAWL_API_URL}`,
      };
    } else {
      return {
        success: false,
        message: result.error || "Failed to scrape test URL",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Connection test failed",
    };
  }
}

// Export configuration for other modules
export const config = {
  FIRECRAWL_API_URL,
  FIRECRAWL_API_KEY,
  SHADCN_BASE_URL,
};
