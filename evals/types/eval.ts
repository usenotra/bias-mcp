import type { Bias, BiasType } from "../../src/types/bias.js";
import type { FetchedPage, SearchHit } from "../../src/types/provider.js";

export type EvalCategory = "saas" | "political" | "reference";

export interface EvalExpectation {
  applicable: boolean | "either";
  minScore?: number;
  maxScore?: number;
  anyTypes?: BiasType[];
}

export interface EvalCase {
  id: string;
  category: EvalCategory;
  description: string;
  intent?: string;
  page: FetchedPage;
  research: SearchHit[];
  expect: EvalExpectation;
}

export interface EvalCheck {
  name: string;
  pass: boolean;
  detail: string;
}

export interface EvalRun {
  id: string;
  category: EvalCategory;
  run: number;
  pass: boolean;
  checks: EvalCheck[];
  bias: Bias;
  ms: number;
}
