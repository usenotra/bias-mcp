import type { z } from "zod";
import type { BIAS_LEVELS, BIAS_TYPES } from "../constants/bias.js";
import type {
  BiasSourceSchema,
  PageBiasAssessmentSchema,
  SearchBiasAssessmentSchema,
} from "../schemas/bias.js";

export type BiasType = (typeof BIAS_TYPES)[number];
export type BiasLevel = (typeof BIAS_LEVELS)[number]["level"];
export type BiasSource = z.infer<typeof BiasSourceSchema>;
export type PageBiasAssessment = z.infer<typeof PageBiasAssessmentSchema>;
export type SearchBiasAssessment = z.infer<typeof SearchBiasAssessmentSchema>;

/** The `bias` object attached to a fetched page. */
export interface Bias {
  applicable: boolean;
  /** 0 (neutral) to 1 (very high). null when not applicable or scoring failed. */
  score: number | null;
  level: BiasLevel | null;
  types: BiasType[];
  publisher: string | null;
  favors: string[];
  reason: string;
  sources: BiasSource[];
  model: string;
  /** True when the page was longer than the model input cap and was cut. */
  truncated: boolean;
  /** Whether a web search on the publisher's ownership/funding was used as evidence. */
  researched: boolean;
  error?: string;
}

/** Lighter `bias` object attached to search results (snippet-only pre-screen). */
export interface SearchResultBias {
  applicable: boolean;
  score: number | null;
  level: BiasLevel | null;
  types: BiasType[];
  reason: string;
  sources: { url: string }[];
}

export interface BiasConfig {
  maxChars: number;
}
