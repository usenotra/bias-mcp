import { PROVIDER_BASE_URLS } from "../constants/providers.js";
import type { Provider } from "../types/provider.js";
import type { ContextScrapeResponse, ContextSearchResponse } from "../types/provider-api.js";
import { postJson } from "../utils/http.js";

export function createContextProvider(apiKey: string): Provider {
  const base = PROVIDER_BASE_URLS.context;
  return {
    id: "context",
    async search({ query, numResults, includeDomains, excludeDomains }) {
      const res = await postJson<ContextSearchResponse>(`${base}/web/search`, apiKey, {
        query,
        numResults,
        includeDomains,
        excludeDomains,
      });
      return res.results.map((r) => ({ url: r.url, title: r.title, snippet: r.description }));
    },
    async fetch({ url }) {
      const res = await postJson<ContextScrapeResponse>(`${base}/web/scrape`, apiKey, {
        url,
        formats: { markdown: true },
        sharedParams: { mainContentOnly: true },
      });
      if (!res.markdown.success || !res.markdown.data) {
        throw new Error(
          `Context.dev could not fetch ${url}: ${res.markdown.error_code ?? ""} ${res.markdown.message ?? ""}`.trim(),
        );
      }
      return {
        url: res.metadata.canonicalUrl ?? res.url ?? url,
        title: res.metadata.title,
        description: res.metadata.description,
        markdown: res.markdown.data,
      };
    },
  };
}
