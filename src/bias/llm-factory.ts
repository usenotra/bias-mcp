import { spawnSync } from "node:child_process";
import { DEFAULT_BIAS_MODEL, DEFAULT_CLAUDE_CLI_MODEL } from "../constants/bias.js";
import type { BiasBackend, StructuredLlm } from "../types/llm.js";
import { createAnthropicLlm } from "./anthropic-llm.js";
import { createClaudeCliLlm } from "./claude-cli-llm.js";

function hasClaudeCli(): boolean {
  const result = spawnSync(process.env.CLAUDE_CLI_PATH ?? "claude", ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

function pickBackend(env: NodeJS.ProcessEnv): BiasBackend | null {
  const requested = env.BIAS_BACKEND;
  if (requested === "anthropic" || requested === "claude-cli") return requested;
  if (env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN) return "anthropic";
  if (hasClaudeCli()) return "claude-cli";
  return null;
}

export function createBiasLlm(env: NodeJS.ProcessEnv = process.env): StructuredLlm | null {
  const backend = pickBackend(env);
  if (backend === "anthropic") return createAnthropicLlm(env.BIAS_MODEL ?? DEFAULT_BIAS_MODEL);
  if (backend === "claude-cli") return createClaudeCliLlm(env.BIAS_MODEL ?? DEFAULT_CLAUDE_CLI_MODEL);
  return null;
}
