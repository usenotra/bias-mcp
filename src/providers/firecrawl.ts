import { PROVIDER_BASE_URLS } from "../constants/providers.js";
import type { Provider } from "../types/provider.js";
import type { FirecrawlScrapeResponse, FirecrawlSearchResponse } from "../types/provider-api.js";
import { postJson } from "../utils/http.js";

export function createFirecrawlProvider(apiKey: string): Provider {
  const base = PROVIDER_BASE_URLS.firecrawl;
  return {
    id: "firecrawl",
    async search({ query, numResults, includeDomains, excludeDomains }) {
      const res = await postJson<FirecrawlSearchResponse>(`${base}/search`, apiKey, {
        query,
        limit: numResults,
        sources: ["web"],
        // Firecrawl rejects requests that set both lists.
        ...(includeDomains?.length ? { includeDomains } : excludeDomains?.length ? { excludeDomains } : {}),
      });
      return (res.data.web ?? []).map((r) => ({
        url: r.url,
        title: r.title ?? "",
        snippet: r.description ?? "",
      }));
    },
    async fetch({ url }) {
      const res = await postJson<FirecrawlScrapeResponse>(`${base}/scrape`, apiKey, {
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      });
      const data = res.data;
      if (!res.success || !data?.markdown) {
        throw new Error(`Firecrawl could not fetch ${url}: ${res.error ?? data?.metadata?.error ?? "no markdown"}`);
      }
      return {
        url: data.metadata?.url ?? url,
        title: data.metadata?.title,
        description: data.metadata?.description,
        markdown: data.markdown,
      };
    },
  };
}
