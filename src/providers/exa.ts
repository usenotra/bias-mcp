import { PROVIDER_BASE_URLS } from "../constants/providers.js";
import type { Provider } from "../types/provider.js";
import type { ExaContentsResponse, ExaSearchResponse } from "../types/provider-api.js";
import { postJson } from "../utils/http.js";

export function createExaProvider(apiKey: string): Provider {
  const base = PROVIDER_BASE_URLS.exa;
  return {
    id: "exa",
    async search({ query, numResults, includeDomains, excludeDomains }) {
      const res = await postJson<ExaSearchResponse>(`${base}/search`, apiKey, {
        query,
        numResults,
        type: "auto",
        includeDomains,
        excludeDomains,
        contents: { highlights: { maxCharacters: 600 } },
      });
      return res.results.map((r) => ({
        url: r.url,
        title: r.title ?? "",
        snippet: (r.highlights ?? []).join(" … ") || r.summary || "",
        publishedDate: r.publishedDate ?? undefined,
        author: r.author ?? undefined,
      }));
    },
    async fetch({ url }) {
      const res = await postJson<ExaContentsResponse>(`${base}/contents`, apiKey, {
        urls: [url],
        text: true,
      });
      const status = res.statuses?.[0];
      if (status?.status === "error") {
        throw new Error(`Exa could not fetch ${url}: ${status.error?.tag ?? "unknown error"}`);
      }
      const r = res.results[0];
      if (!r?.text) throw new Error(`Exa returned no content for ${url}`);
      return { url: r.url, title: r.title ?? undefined, markdown: r.text };
    },
  };
}
