import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { StructuredLlm } from "../types/llm.js";

export function createAnthropicLlm(model: string): StructuredLlm {
  const client = new Anthropic();
  return {
    backend: "anthropic",
    model,
    async generate({ system, prompt, schema, maxTokens }) {
      const response = await client.messages.parse({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
        output_config: { effort: "low", format: zodOutputFormat(schema) },
      });
      if (response.stop_reason === "refusal") throw new Error("bias model declined to assess this input");
      if (!response.parsed_output) {
        throw new Error(`bias model returned no parseable output (stop_reason: ${response.stop_reason})`);
      }
      return response.parsed_output;
    },
  };
}
