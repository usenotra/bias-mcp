import type { Bias, BiasType } from "../../src/types/bias.js";
import type { FetchedPage, SearchHit } from "../../src/types/provider.js";
import type { SiteProfile } from "../../src/types/site.js";

export type EvalCategory = "saas" | "political" | "reference" | "satellite";

export interface EvalExpectation {
  applicable: boolean | "either";
  minScore?: number;
  maxScore?: number;
  anyTypes?: BiasType[];
  noTypes?: BiasType[];
}

export interface EvalCase {
  id: string;
  category: EvalCategory;
  description: string;
  intent?: string;
  page: FetchedPage;
  research: SearchHit[];
  site?: SiteProfile;
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
