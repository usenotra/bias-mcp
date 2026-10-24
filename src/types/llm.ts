import type { z } from "zod";
import type { BIAS_BACKENDS } from "../constants/bias.js";

export type BiasBackend = (typeof BIAS_BACKENDS)[number];

export interface StructuredRequest<T extends z.ZodType> {
  system: string;
  prompt: string;
  schema: T;
  maxTokens: number;
}

export interface StructuredLlm {
  backend: BiasBackend;
  model: string;
  generate<T extends z.ZodType>(request: StructuredRequest<T>): Promise<z.infer<T>>;
}
