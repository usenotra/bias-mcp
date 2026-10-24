import { z } from "zod";
import { PROVIDER_IDS } from "../constants/providers.js";

export const webSearchInput = {
  query: z.string().min(1).max(500).describe("Search query"),
  numResults: z.number().int().min(1).max(50).default(10).describe("Max merged results to return"),
  providers: z
    .array(z.enum(PROVIDER_IDS))
    .optional()
    .describe("Providers to query in parallel; results are merged and deduped. Defaults to all configured."),
  includeDomains: z.array(z.string()).optional().describe("Only return results from these domains"),
  excludeDomains: z.array(z.string()).optional().describe("Never return results from these domains"),
  bias: z
    .boolean()
    .default(false)
    .describe("Pre-screen each result for bias from its snippet (one cheap batched LLM call). For a full, sourced assessment use web_fetch."),
};

export const webFetchInput = {
  url: z.string().url().describe("URL to fetch as markdown"),
  provider: z
    .enum(["auto", ...PROVIDER_IDS])
    .default("auto")
    .describe('Provider to use. "auto" tries firecrawl → context → exa until one succeeds.'),
  bias: z
    .boolean()
    .default(true)
    .describe("Attach a bias assessment ({score 0-1, reason, sources}). On by default; set false to skip the LLM call."),
  intent: z
    .string()
    .optional()
    .describe('What the reader is trying to decide, e.g. "pick a payments provider". Helps judge whether the page has a stake in the answer.'),
  research: z
    .boolean()
    .default(true)
    .describe("Look up the publisher's owner and funding, and profile the site (homepage, other pages, about page) to catch article-only sites that promote one company. Costs one search and up to two fetches per new domain, cached."),
  maxCharacters: z
    .number()
    .int()
    .min(500)
    .optional()
    .describe("Cut the returned markdown to this many characters (bias is still scored on the full page)."),
};
