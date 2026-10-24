import { spawnSync } from "node:child_process";
import { BACKEND_DEFAULT_MODELS, BACKEND_ENV_KEYS, BIAS_BACKENDS } from "../constants/bias.js";
import type { AiSdkBackend, BiasBackend, StructuredLlm } from "../types/llm.js";
import { createAiSdkLlm } from "./ai-sdk-llm.js";
import { createClaudeCliLlm } from "./claude-cli-llm.js";

function hasClaudeCli(): boolean {
  return spawnSync(process.env.CLAUDE_CLI_PATH ?? "claude", ["--version"], { stdio: "ignore" }).status === 0;
}

function isConfigured(backend: BiasBackend, env: NodeJS.ProcessEnv): boolean {
  if (backend === "claude-cli") return hasClaudeCli();
  return BACKEND_ENV_KEYS[backend].every((name) => Boolean(env[name]));
}

export function pickBackend(env: NodeJS.ProcessEnv = process.env): BiasBackend | null {
  const requested = env.BIAS_BACKEND as BiasBackend | undefined;
  if (requested && BIAS_BACKENDS.includes(requested)) return requested;
  return BIAS_BACKENDS.find((backend) => isConfigured(backend, env)) ?? null;
}

export function createBiasLlm(env: NodeJS.ProcessEnv = process.env): StructuredLlm | null {
  const backend = pickBackend(env);
  if (!backend) return null;
  const model = env.BIAS_MODEL ?? BACKEND_DEFAULT_MODELS[backend];
  if (backend === "claude-cli") return createClaudeCliLlm(model);
  return createAiSdkLlm(backend as AiSdkBackend, model, env);
}
