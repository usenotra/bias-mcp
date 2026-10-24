import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BiasScorer } from "../bias/scorer.js";
import type { ProviderRouter } from "../providers/router.js";
import { webSearchInput } from "../schemas/tools.js";
import { errorMessage } from "../utils/error.js";
import { jsonResult } from "../utils/mcp.js";

export function registerWebSearch(server: McpServer, router: ProviderRouter, scorer: BiasScorer | null) {
  server.registerTool(
    "web_search",
    {
      title: "Web search",
      description: `Search the web across ${router.available.join(", ")} in parallel. Results are deduped and ranked by agreement between providers (reciprocal rank fusion); each result lists which providers found it. Optional snippet-level bias pre-screen.`,
      inputSchema: webSearchInput,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ query, numResults, providers, includeDomains, excludeDomains, bias }) => {
      const { results, errors } = await router.search(
        { query, numResults, includeDomains, excludeDomains },
        providers,
      );

      let biasError: string | undefined;
      let biases: Awaited<ReturnType<BiasScorer["scoreSearchResults"]>> = [];
      if (bias) {
        if (!scorer) biasError = "Bias scoring needs ANTHROPIC_API_KEY or the claude CLI.";
        else biases = await scorer.scoreSearchResults(query, results).catch((err) => {
          biasError = errorMessage(err);
          return [];
        });
      }

      return jsonResult({
        query,
        results: results.map((r, i) => ({
          ...r,
          score: Math.round(r.score * 10_000) / 10_000,
          ...(bias ? { bias: biases[i] ?? null } : {}),
        })),
        ...(errors.length ? { providerErrors: errors } : {}),
        ...(biasError ? { biasError } : {}),
      });
    },
  );
}
