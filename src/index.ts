#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BiasScorer } from "./bias/scorer.js";
import { DEFAULT_BIAS_MAX_CHARS, DEFAULT_BIAS_MODEL } from "./constants/bias.js";
import { PROVIDER_ENV_KEYS } from "./constants/providers.js";
import { loadProviders } from "./providers/registry.js";
import { ProviderRouter } from "./providers/router.js";
import { registerWebFetch } from "./tools/web-fetch.js";
import { registerWebSearch } from "./tools/web-search.js";

const providers = loadProviders();
if (providers.size === 0) {
  console.error(
    `web-mcp: no providers configured. Set at least one of ${Object.values(PROVIDER_ENV_KEYS).join(", ")}.`,
  );
  process.exit(1);
}

const router = new ProviderRouter(providers);
const scorer =
  process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
    ? new BiasScorer({
        model: process.env.BIAS_MODEL ?? DEFAULT_BIAS_MODEL,
        maxChars: Number(process.env.BIAS_MAX_CHARS) || DEFAULT_BIAS_MAX_CHARS,
      })
    : null;

const server = new McpServer({ name: "web-mcp", version: "0.1.0" });
registerWebSearch(server, router, scorer);
registerWebFetch(server, router, scorer);

await server.connect(new StdioServerTransport());
console.error(
  `web-mcp ready · providers: ${router.available.join(", ")} · bias: ${scorer ? scorer.model : "disabled (no ANTHROPIC_API_KEY)"}`,
);
