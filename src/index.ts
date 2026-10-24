#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BiasScorer } from "./bias/scorer.js";
import { createBiasLlm } from "./bias/llm-factory.js";
import { DEFAULT_BIAS_MAX_CHARS } from "./constants/bias.js";
import { PROVIDER_ENV_KEYS } from "./constants/providers.js";
import { loadProviders } from "./providers/registry.js";
import { ProviderRouter } from "./providers/router.js";
import { registerWebFetch } from "./tools/web-fetch.js";
import { registerWebSearch } from "./tools/web-search.js";

const providers = loadProviders();
if (providers.size === 0) {
  console.error(
    `bias-mcp: no providers configured. Set at least one of ${Object.values(PROVIDER_ENV_KEYS).flat().join(", ")}.`,
  );
  process.exit(1);
}

const router = new ProviderRouter(providers);
const llm = createBiasLlm();
const scorer = llm
  ? new BiasScorer(llm, { maxChars: Number(process.env.BIAS_MAX_CHARS) || DEFAULT_BIAS_MAX_CHARS })
  : null;

const server = new McpServer({ name: "bias-mcp", version: "0.1.0" });
registerWebSearch(server, router, scorer);
registerWebFetch(server, router, scorer);

await server.connect(new StdioServerTransport());
console.error(
  `bias-mcp ready · provider: ${router.primary}${router.available.length > 1 ? ` (fallback: ${router.available.slice(1).join(", ")})` : ""} · bias: ${scorer ? `${scorer.model} via ${scorer.backend}` : "disabled (no ANTHROPIC_API_KEY or claude CLI)"}`,
);
