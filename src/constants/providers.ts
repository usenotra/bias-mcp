export const PROVIDER_IDS = ["context", "firecrawl", "exa"] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

/** Env vars holding each provider's API key, first match wins. A provider is enabled iff one is set. */
export const PROVIDER_ENV_KEYS: Record<ProviderId, string[]> = {
  context: ["CONTEXT_DEV_API_KEY", "CONTEXT_API_KEY"],
  firecrawl: ["FIRECRAWL_API_KEY"],
  exa: ["EXA_API_KEY"],
};

export const PROVIDER_BASE_URLS: Record<ProviderId, string> = {
  context: "https://api.context.dev/v1",
  firecrawl: "https://api.firecrawl.dev/v2",
  exa: "https://api.exa.ai",
};

export const PROVIDER_PRIORITY: ProviderId[] = ["context", "firecrawl", "exa"];

export const REQUEST_TIMEOUT_MS = 60_000;

/** Constant `k` for reciprocal rank fusion when merging search results. */
export const RRF_K = 60;
