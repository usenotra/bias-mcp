import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { researchPublisher } from "../bias/research.js";
import type { BiasScorer } from "../bias/scorer.js";
import type { ProviderRouter } from "../providers/router.js";
import { webFetchInput } from "../schemas/tools.js";
import type { Bias } from "../types/bias.js";
import { jsonResult } from "../utils/mcp.js";
import { hostnameOf } from "../utils/url.js";

export function registerWebFetch(server: McpServer, router: ProviderRouter, scorer: BiasScorer | null) {
  server.registerTool(
    "web_fetch",
    {
      title: "Web fetch",
      description:
        "Fetch a URL as clean markdown via firecrawl / context.dev / exa (automatic fallback). By default also returns `bias`: {score 0-1, level, types, reason, sources} — e.g. a vendor's 'top 5 tools' list ranking itself #1 scores ~1, docs are marked not applicable. Pass `intent` for a sharper assessment; set bias=false to skip it.",
      inputSchema: webFetchInput,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ url, provider, bias, intent, research, maxCharacters }) => {
      const { page, provider: usedProvider, errors } = await router.fetch(url, provider);

      let biasResult: Bias | { error: string } | undefined;
      if (bias) {
        if (!scorer) {
          biasResult = { error: "Bias scoring needs ANTHROPIC_API_KEY or the claude CLI. Set bias=false to silence this." };
        } else {
          const evidence = research ? await researchPublisher(router, hostnameOf(page.url)) : [];
          biasResult = await scorer.scorePage(page, evidence, intent);
        }
      }

      const cut = maxCharacters !== undefined && page.markdown.length > maxCharacters;
      return jsonResult({
        url: page.url,
        title: page.title ?? null,
        description: page.description ?? null,
        provider: usedProvider,
        ...(biasResult ? { bias: biasResult } : {}),
        ...(errors.length ? { providerErrors: errors } : {}),
        contentTruncated: cut,
        markdown: cut ? page.markdown.slice(0, maxCharacters) : page.markdown,
      });
    },
  );
}
