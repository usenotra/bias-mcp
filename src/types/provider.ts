import type { ProviderId } from "../constants/providers.js";

export interface SearchOptions {
  query: string;
  numResults: number;
  includeDomains?: string[];
  excludeDomains?: string[];
}

export interface SearchHit {
  url: string;
  title: string;
  snippet: string;
  publishedDate?: string;
  author?: string;
}

export interface FetchOptions {
  url: string;
}

export interface FetchedPage {
  url: string;
  title?: string;
  description?: string;
  markdown: string;
}

export interface Provider {
  id: ProviderId;
  search(options: SearchOptions): Promise<SearchHit[]>;
  fetch(options: FetchOptions): Promise<FetchedPage>;
}

/** A search hit after merging results from multiple providers. */
export interface MergedSearchHit extends SearchHit {
  /** Reciprocal-rank-fusion score across providers (higher = better). */
  score: number;
  /** Which providers returned this URL. */
  providers: ProviderId[];
}

export interface ProviderError {
  provider: ProviderId;
  error: string;
}
