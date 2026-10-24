import { createAnthropic } from "@ai-sdk/anthropic";
import { createGateway } from "@ai-sdk/gateway";
import { createNeon } from "@neon/ai-sdk-provider";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, NoObjectGeneratedError, Output, type LanguageModel } from "ai";
import type { z } from "zod";
import type { AiSdkBackend, StructuredLlm } from "../types/llm.js";

function createModel(backend: AiSdkBackend, model: string, env: NodeJS.ProcessEnv): LanguageModel {
  switch (backend) {
    case "neon":
      return createNeon({ baseURL: env.NEON_AI_GATEWAY_BASE_URL, apiKey: env.NEON_AI_GATEWAY_TOKEN })(model);
    case "openrouter":
      return createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })(model);
    case "vercel":
      return createGateway({ apiKey: env.AI_GATEWAY_API_KEY })(model);
    case "anthropic":
      return createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })(model);
  }
}

export function createAiSdkLlm(backend: AiSdkBackend, model: string, env: NodeJS.ProcessEnv): StructuredLlm {
  const languageModel = createModel(backend, model, env);
  return {
    backend,
    model,
    async generate({ system, prompt, schema, maxTokens }) {
      try {
        const result = await generateText({
          model: languageModel,
          system,
          prompt,
          maxOutputTokens: maxTokens,
          output: Output.object({ schema }),
        });
        if (result.finishReason === "content-filter") throw new Error("bias model declined to assess this input");
        return result.output as z.infer<typeof schema>;
      } catch (err) {
        if (NoObjectGeneratedError.isInstance(err)) {
          throw new Error(`bias model returned no parseable output (finish reason: ${err.finishReason ?? "unknown"})`);
        }
        throw err;
      }
    },
  };
}
