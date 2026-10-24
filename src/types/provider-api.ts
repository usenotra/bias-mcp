// Raw response shapes of the upstream APIs (only the fields we read).

export interface ExaResult {
  url: string;
  title?: string | null;
  publishedDate?: string | null;
  author?: string | null;
  text?: string;
  highlights?: string[];
  summary?: string;
}

export interface ExaSearchResponse {
  results: ExaResult[];
}

export interface ExaContentsResponse {
  results: ExaResult[];
  statuses?: { id: string; status: "success" | "error"; error?: { tag?: string } }[];
}

export interface FirecrawlSearchResponse {
  success: boolean;
  data: { web?: { url: string; title?: string; description?: string }[] };
  warning?: string | null;
}

export interface FirecrawlScrapeResponse {
  success: boolean;
  error?: string;
  data?: {
    markdown?: string;
    metadata?: { title?: string; description?: string; url?: string; sourceURL?: string; error?: string };
  };
}

export interface ContextFormatOutput<T> {
  requested: boolean;
  success: boolean;
  data: T | null;
  error_code?: string;
  message?: string;
}

export interface ContextScrapeResponse {
  url: string;
  markdown: ContextFormatOutput<string>;
  metadata: { title?: string; description?: string; canonicalUrl?: string };
}

export interface ContextSearchResponse {
  results: {
    url: string;
    title: string;
    description: string;
    relevance: "high" | "medium" | "low";
  }[];
}
