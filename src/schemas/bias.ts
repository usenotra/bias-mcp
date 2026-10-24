import { z } from "zod";
import { BIAS_TYPES } from "../constants/bias.js";

export const BiasSourceSchema = z.object({
  url: z.string().describe("URL of the page or research result that supports this point"),
  title: z.string().nullable(),
  evidence: z.string().describe("Short quote or fact from that source"),
});

/** What the bias model must return for a fetched page. */
export const PageBiasAssessmentSchema = z.object({
  applicable: z.boolean().describe("false for docs/reference pages where bias is not meaningful"),
  score: z.number().nullable().describe("0 = neutral, 1 = very high bias; null when not applicable"),
  types: z.array(z.enum(BIAS_TYPES)),
  publisher: z.string().nullable().describe("Who is behind the page (company, outlet, author)"),
  favors: z.array(z.string()).describe("Products, companies, parties or positions the page favors"),
  reason: z.string(),
  sources: z.array(BiasSourceSchema),
});

export const SiteAssessmentSchema = z.object({
  satellite: z.boolean().describe("true when the whole site looks like an article-only front for one company"),
  favors: z.string().nullable().describe("The company the site appears to promote"),
  evidence: z.string().describe("What in the profile shows it, quoted where possible"),
  sources: z.array(z.string()).describe("URLs from the site profile that support the evidence"),
});

/** Batched, snippet-level pre-screen for search results. */
export const SearchBiasAssessmentSchema = z.object({
  results: z.array(
    z.object({
      index: z.number().int(),
      applicable: z.boolean(),
      score: z.number().nullable(),
      types: z.array(z.enum(BIAS_TYPES)),
      reason: z.string(),
    }),
  ),
});
