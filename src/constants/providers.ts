export const PROVIDER_IDS = ["exa", "firecrawl", "context"] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

/** Env vars holding each provider's API key, first match wins. A provider is enabled iff one is set. */
export const PROVIDER_ENV_KEYS: Record<ProviderId, string[]> = {
  exa: ["EXA_API_KEY"],
  firecrawl: ["FIRECRAWL_API_KEY"],
  context: ["CONTEXT_DEV_API_KEY", "CONTEXT_API_KEY"],
};

export const PROVIDER_BASE_URLS: Record<ProviderId, string> = {
  exa: "https://api.exa.ai",
  firecrawl: "https://api.firecrawl.dev/v2",
  context: "https://api.context.dev/v1",
};

/** Order tried by `web_fetch` with provider "auto" (first success wins). */
export const DEFAULT_FETCH_ORDER: ProviderId[] = ["firecrawl", "context", "exa"];

export const REQUEST_TIMEOUT_MS = 60_000;

/** Constant `k` for reciprocal rank fusion when merging search results. */
export const RRF_K = 60;
